import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiInfo, FiMail, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/src/assets/logo.webp"
            alt="Logo"
            className="h-8 hover:scale-105 transition-transform duration-200"
          />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex space-x-8">
          <a
            href="#"
            className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
          >
            <FiInfo className="mr-1" /> About
          </a>
          <a
            href="#"
            className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
          >
            <FiMail className="mr-1" /> Contact
          </a>
          {!loading && (
            <>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
                >
                  <FiUser className="mr-1" /> Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
