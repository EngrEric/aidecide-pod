# Smart Stores POD Qualification App - PRD

## Original Problem Statement
Build a sleek, simple React web app for Smart Stores to qualify customers for Payment on Delivery (POD) shoe orders. Create a lightweight customer-facing form and a simple admin dashboard that automatically scores responses and classifies customers.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Database**: Firebase Firestore (serverless)
- **Authentication**: Firebase Authentication (email/password)
- **Hosting**: Firebase Hosting ready

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
- [x] Scoring algorithm (utils/scoring.js)
- [x] Classification: Approved (>=70), Deposit Required (45-69), Not Qualified (<45)
- [x] Risk flags: high_risk, payment_risk, incomplete_address, incomplete_landmark, weak_contact
- [x] Firebase Authentication for admin login
- [x] Firebase Firestore for data persistence
- [x] Admin dashboard with stats cards (Total, Approved, Deposit, Not Qualified, High Risk)
- [x] Submissions table with filters
- [x] Submission detail modal with score breakdown
- [x] Delete submission functionality
- [x] Premium light theme with Manrope/Public Sans fonts

## Firebase Configuration
- **Project ID**: smartstores-qualify-customers
- **Admin Email**: admin@smartstores.com
- **Firestore Collection**: `submissions`

## Configuration Files
- Frontend scoring: `/app/frontend/src/utils/scoring.js` - Edit SCORING_CONFIG and THRESHOLDS
- Firebase config: `/app/frontend/src/lib/firebase.js`
- Firebase API: `/app/frontend/src/lib/firebaseApi.js`

## Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

## Prioritized Backlog

### P0 - Critical (None remaining)
All core features implemented

### P1 - Important
- Export submissions to CSV
- Date range filtering
- Search functionality

### P2 - Nice to Have
- Email notifications for new submissions
- WhatsApp notification integration
- Multiple admin users

## Next Tasks
1. Deploy to Firebase Hosting
2. Add search functionality in admin dashboard
3. Add date range filter
