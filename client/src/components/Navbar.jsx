import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiInfo,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiLayers,
  FiGrid,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import logo from "../assets/logo.webp";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading } = useAuth();
  const { isMobile, isRetina, touchCapable } = useResponsive();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ to, icon, children, onClick }) => {
    const IconComponent = icon;
    return (
      <Link
        to={to}
        onClick={onClick || closeMobileMenu}
        className={`flex items-center transition-all duration-200 ${
          isMobile
            ? `${
                isRetina ? "text-lg py-3 px-4" : "text-base py-2 px-3"
              } text-gray-200 hover:text-blue-400 rounded-lg hover:bg-gray-700 ${
                touchCapable ? "touch-target" : ""
              }`
            : "text-base lg:text-lg text-gray-200 hover:text-blue-400 hover:scale-105"
        }`}
      >
        <IconComponent
          className={isMobile ? "mr-2" : "mr-1"}
          size={isMobile ? (isRetina ? 20 : 18) : 16}
        />
        {children}
      </Link>
    );
  };

  const NavButton = ({ onClick, icon, children }) => {
    const IconComponent = icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center transition-all duration-200 ${
          isMobile
            ? `${
                isRetina ? "text-lg py-3 px-4" : "text-base py-2 px-3"
              } text-gray-200 hover:text-blue-400 rounded-lg hover:bg-gray-700 w-full text-left ${
                touchCapable ? "touch-target" : ""
              }`
            : "text-base lg:text-lg text-gray-200 hover:text-blue-400 hover:scale-105"
        }`}
      >
        <IconComponent
          className={isMobile ? "mr-2" : "mr-1"}
          size={isMobile ? (isRetina ? 20 : 18) : 16}
        />
        {children}
      </button>
    );
  };

  return (
    <nav className="bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 shadow-2xl shadow-gray-800/60 backdrop-blur-sm relative z-20">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
          <img
            src={logo}
            alt="Logo"
            className={`${
              isMobile ? (isRetina ? "h-7" : "h-6") : "h-8"
            } hover:scale-105 transition-transform duration-200`}
          />
          <span className="sr-only">Home</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex space-x-4 lg:space-x-6">
            <NavLink to="/" icon={FiHome}>
              Home
            </NavLink>
            <NavLink to="/about" icon={FiInfo}>
              About
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/requirements" icon={FiLayers}>
                  Requirements
                </NavLink>
                <NavLink to="/apps" icon={FiGrid}>
                  Applications
                </NavLink>
                <NavLink to="/profile" icon={FiUser}>
                  Profile
                </NavLink>
              </>
            ) : null}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <NavButton onClick={handleLogout} icon={FiLogOut}>
                    Logout
                  </NavButton>
                ) : (
                  <NavLink to="/login" icon={FiLogIn}>
                    Login
                  </NavLink>
                )}
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`text-gray-200 hover:text-blue-400 transition-colors duration-200 ${
              touchCapable ? "p-3 touch-target" : "p-2"
            } ${
              isRetina ? "min-w-12 min-h-12" : "min-w-10 min-h-10"
            } flex items-center justify-center`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX size={isRetina ? 26 : 24} />
            ) : (
              <FiMenu size={isRetina ? 26 : 24} />
            )}
          </button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-95 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-700 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-0.5 p-1.5">
              <NavLink to="/" icon={FiHome}>
                Home
              </NavLink>
              <NavLink to="/about" icon={FiInfo}>
                About
              </NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/requirements" icon={FiLayers}>
                    Requirements
                  </NavLink>
                  <NavLink to="/apps" icon={FiGrid}>
                    Applications
                  </NavLink>
                  <NavLink to="/profile" icon={FiUser}>
                    Profile
                  </NavLink>
                </>
              ) : null}
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <NavButton onClick={handleLogout} icon={FiLogOut}>
                      Logout
                    </NavButton>
                  ) : (
                    <NavLink to="/login" icon={FiLogIn}>
                      Login
                    </NavLink>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
