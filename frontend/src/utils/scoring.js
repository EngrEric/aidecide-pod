/**
 * Scoring Utility for Smart Stores POD Qualification
 * ===================================================
 * Edit the SCORING_CONFIG object to adjust scores for each question option.
 * Edit the THRESHOLDS object to adjust classification boundaries.
 */

// =============================================================================
// SCORING CONFIGURATION
// Edit these values to adjust the scoring algorithm
// =============================================================================

export const SCORING_CONFIG = {
  // Question 9: Who are you buying for?
  buying_for: {
    "Myself": 10,
    "Family/Friend": 8,
    "Resale/Business": 20
  },
  
  // Question 10: How often do you shop online?
  shopping_frequency: {
    "Very often": 20,
    "Occasionally": 10,
    "First time": 0
  },
  
  // Question 11: Have you bought shoes online before?
  bought_shoes_online: {
    "Yes": 15,
    "No": 0
  },
  
  // Question 12: Buying behavior
  buying_behavior: {
    "I already know my size and pay immediately": 20,
    "I quickly check size then pay": 8,
    "I prefer testing and deciding before paying": -25
  },
  
  // Question 13: Payment readiness
  payment_readiness: {
    "Cash ready on delivery": 20,
    "Bank transfer immediately": 18,
    "I may need time to arrange payment": -20
  },
  
  // Question 14: Delivery availability
  delivery_availability: {
    "Yes": 15,
    "No": -10,
    "Someone else will receive it": 5
  },
  
  // Question 15: Commitment fee preference
  commitment_preference: {
    "POD without deposit": 0,
    "POD with small commitment fee": 15,
    "I prefer paying fully before delivery": 25
  },
  
  // Final confirmation checkbox
  confirmation_bonus: 10
};

// =============================================================================
// CLASSIFICATION THRESHOLDS
// Edit these values to adjust the approval boundaries
// =============================================================================

export const THRESHOLDS = {
  approved: 70,      // Score >= 70: Approved for POD
  deposit: 45        // Score >= 45 and < 70: POD with deposit required
                     // Score < 45: Not qualified for POD
};

// =============================================================================
// STATUS LABELS AND COLORS
// =============================================================================

export const STATUS_CONFIG = {
  approved: {
    label: "Approved for POD",
    shortLabel: "Approved",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  deposit_required: {
    label: "POD with Deposit",
    shortLabel: "Deposit Required",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200"
  },
  not_qualified: {
    label: "Not Qualified",
    shortLabel: "Not Qualified",
    color: "bg-red-50 text-red-700 border-red-200"
  }
};

export const FLAG_CONFIG = {
  high_risk: {
    label: "High Risk - Prefers testing",
    shortLabel: "High Risk",
    color: "bg-red-100 text-red-800 border-red-300"
  },
  payment_risk: {
    label: "Payment Risk - Needs time",
    shortLabel: "Payment Risk",
    color: "bg-orange-100 text-orange-800 border-orange-300"
  },
  incomplete_address: {
    label: "Incomplete Address",
    shortLabel: "Address Issue",
    color: "bg-zinc-100 text-zinc-700 border-zinc-300"
  },
  incomplete_landmark: {
    label: "Missing Landmark",
    shortLabel: "Landmark Issue",
    color: "bg-zinc-100 text-zinc-700 border-zinc-300"
  },
  weak_contact: {
    label: "No Alternative Phone",
    shortLabel: "Contact Issue",
    color: "bg-zinc-100 text-zinc-700 border-zinc-300"
  }
};

// =============================================================================
// QUESTION OPTIONS
// Used for rendering the form
// =============================================================================

export const QUESTION_OPTIONS = {
  buying_for: [
    "Myself",
    "Family/Friend",
    "Resale/Business"
  ],
  shopping_frequency: [
    "Very often",
    "Occasionally",
    "First time"
  ],
  bought_shoes_online: [
    "Yes",
    "No"
  ],
  buying_behavior: [
    "I already know my size and pay immediately",
    "I quickly check size then pay",
    "I prefer testing and deciding before paying"
  ],
  payment_readiness: [
    "Cash ready on delivery",
    "Bank transfer immediately",
    "I may need time to arrange payment"
  ],
  delivery_availability: [
    "Yes",
    "No",
    "Someone else will receive it"
  ],
  commitment_preference: [
    "POD without deposit",
    "POD with small commitment fee",
    "I prefer paying fully before delivery"
  ]
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getStatusLabel = (status) => {
  return STATUS_CONFIG[status]?.label || status;
};

export const getStatusColor = (status) => {
  return STATUS_CONFIG[status]?.color || "bg-zinc-100 text-zinc-600";
};

export const getFlagLabel = (flag) => {
  return FLAG_CONFIG[flag]?.label || flag;
};

export const getFlagColor = (flag) => {
  return FLAG_CONFIG[flag]?.color || "bg-zinc-100 text-zinc-600";
};
