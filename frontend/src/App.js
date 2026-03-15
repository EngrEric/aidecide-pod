import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import CustomerForm from "@/pages/CustomerForm";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import { useState, useEffect, createContext, useContext } from "react";
import { firebaseApi } from "@/lib/firebaseApi";

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = firebaseApi.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = async (email, password) => {
    const result = await firebaseApi.adminLogin(email, password);
    return result;
  };
  
  const logout = async () => {
    await firebaseApi.adminLogout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
