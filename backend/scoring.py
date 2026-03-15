"""
Scoring Utility for Smart Stores POD Qualification
===================================================
Edit the SCORING_CONFIG dictionary to adjust scores for each question option.
Edit the THRESHOLDS dictionary to adjust classification boundaries.
"""

# =============================================================================
# SCORING CONFIGURATION
# Edit these values to adjust the scoring algorithm
# =============================================================================

SCORING_CONFIG = {
    # Question 9: Who are you buying for?
    "buying_for": {
        "Myself": 10,
        "Family/Friend": 8,
        "Resale/Business": 20
    },
    
    # Question 10: How often do you shop online?
    "shopping_frequency": {
        "Very often": 20,
        "Occasionally": 10,
        "First time": 0
    },
    
    # Question 11: Have you bought shoes online before?
    "bought_shoes_online": {
        "Yes": 15,
        "No": 0
    },
    
    # Question 12: Buying behavior
    "buying_behavior": {
        "I already know my size and pay immediately": 20,
        "I quickly check size then pay": 8,
        "I prefer testing and deciding before paying": -25
    },
    
    # Question 13: Payment readiness
    "payment_readiness": {
        "Cash ready on delivery": 20,
        "Bank transfer immediately": 18,
        "I may need time to arrange payment": -20
    },
    
    # Question 14: Delivery availability
    "delivery_availability": {
        "Yes": 15,
        "No": -10,
        "Someone else will receive it": 5
    },
    
    # Question 15: Commitment fee preference
    "commitment_preference": {
        "POD without deposit": 0,
        "POD with small commitment fee": 15,
        "I prefer paying fully before delivery": 25
    },
    
    # Final confirmation checkbox
    "confirmation_bonus": 10
}

# =============================================================================
# CLASSIFICATION THRESHOLDS
# Edit these values to adjust the approval boundaries
# =============================================================================

THRESHOLDS = {
    "approved": 70,      # Score >= 70: Approved for POD
    "deposit": 45        # Score >= 45 and < 70: POD with deposit required
                         # Score < 45: Not qualified for POD
}

# =============================================================================
# ADDRESS VALIDATION SETTINGS
# =============================================================================

MIN_ADDRESS_LENGTH = 15
MIN_LANDMARK_LENGTH = 5


def calculate_score(submission: dict) -> dict:
    """
    Calculate the POD qualification score and generate flags.
    
    Args:
        submission: Dictionary containing all form responses
        
    Returns:
        Dictionary with score, status, flags, and score breakdown
    """
    score = 0
    breakdown = {}
    flags = []
    
    # Calculate scores for each category
    if submission.get("buying_for"):
        points = SCORING_CONFIG["buying_for"].get(submission["buying_for"], 0)
        score += points
        breakdown["buying_for"] = {"answer": submission["buying_for"], "points": points}
    
    if submission.get("shopping_frequency"):
        points = SCORING_CONFIG["shopping_frequency"].get(submission["shopping_frequency"], 0)
        score += points
        breakdown["shopping_frequency"] = {"answer": submission["shopping_frequency"], "points": points}
    
    if submission.get("bought_shoes_online"):
        points = SCORING_CONFIG["bought_shoes_online"].get(submission["bought_shoes_online"], 0)
        score += points
        breakdown["bought_shoes_online"] = {"answer": submission["bought_shoes_online"], "points": points}
    
    if submission.get("buying_behavior"):
        points = SCORING_CONFIG["buying_behavior"].get(submission["buying_behavior"], 0)
        score += points
        breakdown["buying_behavior"] = {"answer": submission["buying_behavior"], "points": points}
        # Flag: High risk if prefers testing
        if submission["buying_behavior"] == "I prefer testing and deciding before paying":
            flags.append("high_risk")
    
    if submission.get("payment_readiness"):
        points = SCORING_CONFIG["payment_readiness"].get(submission["payment_readiness"], 0)
        score += points
        breakdown["payment_readiness"] = {"answer": submission["payment_readiness"], "points": points}
        # Flag: Payment risk
        if submission["payment_readiness"] == "I may need time to arrange payment":
            flags.append("payment_risk")
    
    if submission.get("delivery_availability"):
        points = SCORING_CONFIG["delivery_availability"].get(submission["delivery_availability"], 0)
        score += points
        breakdown["delivery_availability"] = {"answer": submission["delivery_availability"], "points": points}
    
    if submission.get("commitment_preference"):
        points = SCORING_CONFIG["commitment_preference"].get(submission["commitment_preference"], 0)
        score += points
        breakdown["commitment_preference"] = {"answer": submission["commitment_preference"], "points": points}
    
    # Confirmation bonus
    if submission.get("confirmation"):
        score += SCORING_CONFIG["confirmation_bonus"]
        breakdown["confirmation"] = {"answer": "Yes", "points": SCORING_CONFIG["confirmation_bonus"]}
    
    # Address validation flags
    address = submission.get("address", "")
    landmark = submission.get("landmark", "")
    
    if len(address) < MIN_ADDRESS_LENGTH:
        flags.append("incomplete_address")
    
    if len(landmark) < MIN_LANDMARK_LENGTH:
        flags.append("incomplete_landmark")
    
    # Contact validation flag
    if not submission.get("alternative_phone"):
        flags.append("weak_contact")
    
    # Determine status based on score
    if score >= THRESHOLDS["approved"]:
        status = "approved"
    elif score >= THRESHOLDS["deposit"]:
        status = "deposit_required"
    else:
        status = "not_qualified"
    
    return {
        "score": score,
        "status": status,
        "flags": flags,
        "breakdown": breakdown
    }


def get_status_label(status: str) -> str:
    """Get human-readable status label."""
    labels = {
        "approved": "Approved for POD",
        "deposit_required": "POD with Deposit",
        "not_qualified": "Not Qualified"
    }
    return labels.get(status, status)


def get_flag_label(flag: str) -> str:
    """Get human-readable flag label."""
    labels = {
        "high_risk": "High Risk - Prefers testing",
        "payment_risk": "Payment Risk - Needs time",
        "incomplete_address": "Incomplete Address",
        "incomplete_landmark": "Missing Landmark",
        "weak_contact": "No Alternative Phone"
    }
    return labels.get(flag, flag)
