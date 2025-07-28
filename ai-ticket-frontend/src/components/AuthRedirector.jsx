// ai-ticket-frontend/src/components/AuthRedirector.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthRedirector() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // If token exists, user is authenticated, redirect to main app
      navigate("/"); // Or '/tickets' if you prefer a more explicit main page
    } else {
      // If no token, user is not authenticated, redirect to signup
      navigate("/signup");
    }
    setLoading(false); // Set loading to false after decision
  }, [navigate]); // Dependency array: run once on mount, or if navigate changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 text-lg">
        Loading authentication status...
      </div>
    );
  }
  return null; // This component doesn't render anything after redirecting
}