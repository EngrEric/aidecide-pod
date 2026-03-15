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
// ADDRESS VALIDATION SETTINGS
// =============================================================================

const MIN_ADDRESS_LENGTH = 15;
const MIN_LANDMARK_LENGTH = 5;

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
// SCORING CALCULATION FUNCTION
// =============================================================================

export const calculateScore = (submission) => {
  let score = 0;
  const breakdown = {};
  const flags = [];

  // Calculate scores for each category
  if (submission.buying_for) {
    const points = SCORING_CONFIG.buying_for[submission.buying_for] || 0;
    score += points;
    breakdown.buying_for = { answer: submission.buying_for, points };
  }

  if (submission.shopping_frequency) {
    const points = SCORING_CONFIG.shopping_frequency[submission.shopping_frequency] || 0;
    score += points;
    breakdown.shopping_frequency = { answer: submission.shopping_frequency, points };
  }

  if (submission.bought_shoes_online) {
    const points = SCORING_CONFIG.bought_shoes_online[submission.bought_shoes_online] || 0;
    score += points;
    breakdown.bought_shoes_online = { answer: submission.bought_shoes_online, points };
  }

  if (submission.buying_behavior) {
    const points = SCORING_CONFIG.buying_behavior[submission.buying_behavior] || 0;
    score += points;
    breakdown.buying_behavior = { answer: submission.buying_behavior, points };
    // Flag: High risk if prefers testing
    if (submission.buying_behavior === "I prefer testing and deciding before paying") {
      flags.push("high_risk");
    }
  }

  if (submission.payment_readiness) {
    const points = SCORING_CONFIG.payment_readiness[submission.payment_readiness] || 0;
    score += points;
    breakdown.payment_readiness = { answer: submission.payment_readiness, points };
    // Flag: Payment risk
    if (submission.payment_readiness === "I may need time to arrange payment") {
      flags.push("payment_risk");
    }
  }

  if (submission.delivery_availability) {
    const points = SCORING_CONFIG.delivery_availability[submission.delivery_availability] || 0;
    score += points;
    breakdown.delivery_availability = { answer: submission.delivery_availability, points };
  }

  if (submission.commitment_preference) {
    const points = SCORING_CONFIG.commitment_preference[submission.commitment_preference] || 0;
    score += points;
    breakdown.commitment_preference = { answer: submission.commitment_preference, points };
  }

  // Confirmation bonus
  if (submission.confirmation) {
    score += SCORING_CONFIG.confirmation_bonus;
    breakdown.confirmation = { answer: "Yes", points: SCORING_CONFIG.confirmation_bonus };
  }

  // Address validation flags
  const address = submission.address || "";
  const landmark = submission.landmark || "";

  if (address.length < MIN_ADDRESS_LENGTH) {
    flags.push("incomplete_address");
  }

  if (landmark.length < MIN_LANDMARK_LENGTH) {
    flags.push("incomplete_landmark");
  }

  // Contact validation flag
  if (!submission.alternative_phone) {
    flags.push("weak_contact");
  }

  // Determine status based on score
  let status;
  if (score >= THRESHOLDS.approved) {
    status = "approved";
  } else if (score >= THRESHOLDS.deposit) {
    status = "deposit_required";
  } else {
    status = "not_qualified";
  }

  return {
    score,
    status,
    flags,
    breakdown
  };
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
