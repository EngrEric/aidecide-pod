# Smart Stores POD Qualification App - PRD

## Original Problem Statement
Build a sleek, simple React web app for Smart Stores to qualify customers for Payment on Delivery (POD) shoe orders. Create a lightweight customer-facing form and a simple admin dashboard that automatically scores responses and classifies customers.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Hard-coded admin credentials

## User Personas
1. **Customer**: Fills out POD verification form to qualify for payment on delivery
2. **Admin**: Reviews submissions, views scores, and manages orders

## Core Requirements (Static)
- Multi-step customer form (15 fields across 5 steps)
- Scoring algorithm with configurable thresholds
- Risk flagging system
- Admin dashboard with stats and filters
- Premium, minimal light theme design

## What's Been Implemented (Jan 2026)
- [x] Multi-step customer form with progress indicator
- [x] All 15 form fields (Personal Info, Delivery Address, Order Details, Shopping Profile, Payment Preferences)
- [x] Scoring algorithm (scoring.py / scoring.js)
- [x] Classification: Approved (>=70), Deposit Required (45-69), Not Qualified (<45)
- [x] Risk flags: high_risk, payment_risk, incomplete_address, incomplete_landmark, weak_contact
- [x] Admin login (hard-coded: admin@smartstores.com / smartstores2024)
- [x] Admin dashboard with stats cards (Total, Approved, Deposit, Not Qualified, High Risk)
- [x] Submissions table with filters
- [x] Submission detail modal with score breakdown
- [x] Delete submission functionality
- [x] Premium light theme with Manrope/Public Sans fonts

## Prioritized Backlog

### P0 - Critical (None remaining)
All core features implemented

### P1 - Important
- Google Sheets integration for data export (user requested, not yet implemented)
- Mobile-specific UI optimizations

### P2 - Nice to Have
- Email notifications for new submissions
- Export submissions to CSV
- Date range filtering
- Search functionality

## Configuration Files
- Backend scoring: `/app/backend/scoring.py` - Edit SCORING_CONFIG and THRESHOLDS
- Frontend scoring: `/app/frontend/src/utils/scoring.js` - Mirror of backend config
- Admin credentials: `/app/backend/.env` - ADMIN_EMAIL, ADMIN_PASSWORD

## API Endpoints
- POST /api/admin/login - Admin authentication
- POST /api/submissions - Create new submission
- GET /api/submissions - List all submissions (with optional filters)
- GET /api/submissions/{id} - Get single submission
- DELETE /api/submissions/{id} - Delete submission
- GET /api/dashboard/stats - Dashboard statistics

## Next Tasks
1. Integrate Google Sheets for data persistence (user requested)
2. Add search functionality in admin dashboard
3. Add date range filter
