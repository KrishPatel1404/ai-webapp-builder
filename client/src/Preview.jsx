import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function Preview() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Hello, World! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Welcome to the Preview page, {user?.name || "User"}!
            </p>
            <p className="text-gray-500">
              This is a simple authenticated preview area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;
