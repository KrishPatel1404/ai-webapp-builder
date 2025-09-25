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
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Pattern overlay on dark background */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(240,240,240,0.05)_1.5px,_transparent_1px)] [background-size:30px_30px]"></div>
      </div>

      {/* Navbar on top */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10">
        <h1 className="text-6xl md:text-6xl font-bold text-white mb-2 text-center transition-colors duration-200">
          Welcome to the Preview page, {user?.name || "User"}!
        </h1>
      </div>
    </div>
  );
}

export default Preview;
