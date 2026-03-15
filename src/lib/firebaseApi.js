// Firebase API service for Smart Stores
import { db, auth } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { calculateScore } from '@/utils/scoring';

// Collection name
const SUBMISSIONS_COLLECTION = 'submissions';

// =============================================================================
// AUTH FUNCTIONS
// =============================================================================

export const firebaseApi = {
  // Admin login with Firebase Auth
  adminLogin: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      message: "Login successful",
      user: userCredential.user
    };
  },

  // Admin logout
  adminLogout: async () => {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Auth state listener
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // =============================================================================
  // SUBMISSIONS FUNCTIONS
  // =============================================================================

  // Create submission
  createSubmission: async (data) => {
    // Calculate score using the scoring utility
    const scoringResult = calculateScore(data);
    
    const submissionData = {
      ...data,
      score: scoringResult.score,
      status: scoringResult.status,
      flags: scoringResult.flags,
      breakdown: scoringResult.breakdown,
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionData);
    
    return {
      id: docRef.id,
      ...submissionData,
      created_at: new Date() // Return current date for immediate display
    };
  },

  // Get all submissions with optional filters
  getSubmissions: async (status = null, flagged = null) => {
    // Fetch all submissions and filter client-side
    // This avoids Firestore composite index requirements
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date()
    }));

    // Apply filters client-side
    if (status) {
      submissions = submissions.filter(sub => sub.status === status);
    }
    
    if (flagged) {
      submissions = submissions.filter(sub => sub.flags && sub.flags.length > 0);
    }

    return submissions;
  },

  // Get single submission
  getSubmission: async (id) => {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Submission not found');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      created_at: docSnap.data().created_at?.toDate() || new Date()
    };
  },

  // Delete submission
  deleteSubmission: async (id) => {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
    return { message: 'Submission deleted successfully' };
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const querySnapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    
    let total = 0;
    let approved = 0;
    let deposit_required = 0;
    let not_qualified = 0;
    let high_risk = 0;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      total++;
      
      if (data.status === 'approved') approved++;
      else if (data.status === 'deposit_required') deposit_required++;
      else if (data.status === 'not_qualified') not_qualified++;
      
      if (data.flags && data.flags.includes('high_risk')) high_risk++;
    });

    return { total, approved, deposit_required, not_qualified, high_risk };
  }
};

export default firebaseApi;
