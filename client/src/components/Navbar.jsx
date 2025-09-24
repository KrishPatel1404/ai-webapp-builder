import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiInfo,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiLayers,
  FiMonitor,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.webp";

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
            src={logo}
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
          {isAuthenticated ? (
            <>
              <Link
                to="/requirements"
                className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
              >
                <FiLayers className="mr-1" /> Requirements
              </Link>
              <Link
                to="/previews"
                className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
              >
                <FiMonitor className="mr-1" /> Apps
              </Link>
              <Link
                to="/profile"
                className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
              >
                <FiUser className="mr-1" /> Profile
              </Link>
            </>
          ) : null}
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
                  <FiLogIn className="mr-1" /> Login
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
