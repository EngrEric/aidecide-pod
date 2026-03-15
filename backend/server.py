from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from scoring import calculate_score, get_status_label, get_flag_label

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Admin credentials from environment
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@smartstores.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'smartstores2024')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =============================================================================
# MODELS
# =============================================================================

class SubmissionCreate(BaseModel):
    full_name: str
    active_phone: str
    alternative_phone: Optional[str] = ""
    address: str
    landmark: str
    shoe_model: str
    shoe_size: str
    shoe_color: str
    buying_for: str
    shopping_frequency: str
    bought_shoes_online: str
    buying_behavior: str
    payment_readiness: str
    delivery_availability: str
    commitment_preference: str
    confirmation: bool = False

class Submission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    active_phone: str
    alternative_phone: Optional[str] = ""
    address: str
    landmark: str
    shoe_model: str
    shoe_size: str
    shoe_color: str
    buying_for: str
    shopping_frequency: str
    bought_shoes_online: str
    buying_behavior: str
    payment_readiness: str
    delivery_availability: str
    commitment_preference: str
    confirmation: bool = False
    score: int = 0
    status: str = ""
    flags: List[str] = []
    breakdown: dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

class DashboardStats(BaseModel):
    total: int
    approved: int
    deposit_required: int
    not_qualified: int
    high_risk: int

# =============================================================================
# ROUTES
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "Smart Stores POD API"}

# Admin login
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    if request.email == ADMIN_EMAIL and request.password == ADMIN_PASSWORD:
        # Simple token for MVP - in production use JWT
        token = f"admin_{uuid.uuid4()}"
        return AdminLoginResponse(
            success=True,
            message="Login successful",
            token=token
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Create submission
@api_router.post("/submissions", response_model=Submission)
async def create_submission(input_data: SubmissionCreate):
    # Calculate score
    scoring_result = calculate_score(input_data.model_dump())
    
    # Create submission object
    submission = Submission(
        **input_data.model_dump(),
        score=scoring_result["score"],
        status=scoring_result["status"],
        flags=scoring_result["flags"],
        breakdown=scoring_result["breakdown"]
    )
    
    # Convert to dict for MongoDB
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.submissions.insert_one(doc)
    return submission

# Get all submissions
@api_router.get("/submissions", response_model=List[Submission])
async def get_submissions(status: Optional[str] = None, flagged: Optional[bool] = None):
    query = {}
    
    if status:
        query["status"] = status
    
    if flagged:
        query["flags"] = {"$ne": []}
    
    submissions = await db.submissions.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Convert ISO timestamps back to datetime
    for sub in submissions:
        if isinstance(sub.get('created_at'), str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
    
    return submissions

# Get single submission
@api_router.get("/submissions/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str):
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if isinstance(submission.get('created_at'), str):
        submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    
    return submission

# Get dashboard stats
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    total = await db.submissions.count_documents({})
    approved = await db.submissions.count_documents({"status": "approved"})
    deposit_required = await db.submissions.count_documents({"status": "deposit_required"})
    not_qualified = await db.submissions.count_documents({"status": "not_qualified"})
    high_risk = await db.submissions.count_documents({"flags": "high_risk"})
    
    return DashboardStats(
        total=total,
        approved=approved,
        deposit_required=deposit_required,
        not_qualified=not_qualified,
        high_risk=high_risk
    )

# Delete submission (for admin)
@api_router.delete("/submissions/{submission_id}")
async def delete_submission(submission_id: str):
    result = await db.submissions.delete_one({"id": submission_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return {"message": "Submission deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
