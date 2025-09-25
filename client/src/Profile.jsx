import React, { useState, useEffect } from "react";
import { FiMail, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";
import { useResponsive } from "./hooks/useResponsive";

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isMobile, isTablet, isDesktop, touchCapable } = useResponsive();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [confirmMode, setConfirmMode] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset confirmation mode and clear messages when user starts typing
    setConfirmMode(false);
    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // First click - enter confirmation mode
    if (!confirmMode) {
      setConfirmMode(true);
      setMessage("");
      return;
    }

    // Second click - actually submit
    // Validation
    if (!formData.name.trim()) {
      setConfirmMode(false);
      setMessage("Please enter your name");
      setMessageType("error");
      return;
    }

    if (!formData.email.trim()) {
      setConfirmMode(false);
      setMessage("Please enter your email");
      setMessageType("error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setConfirmMode(false);
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/updatedetails`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Profile updated successfully:", data);
        updateUser(data.user);
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setConfirmMode(false);
      } else {
        setMessage(data.message || "Failed to update profile");
        setMessageType("error");
        setConfirmMode(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
      setConfirmMode(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Animated Background */}
      <AnimatedBackground animate={false} />
      {/* Main content */}
      <div
        className={`flex-grow flex flex-col items-center justify-center px-4 relative z-10 ${
          isMobile ? "py-6" : "py-8"
        }`}
      >
        <div
          className={`w-full ${
            isMobile ? "max-w-sm" : isTablet ? "max-w-lg" : "max-w-md"
          }`}
        >
          <h1
            className={`font-bold text-white ${
              isMobile ? "mb-6 text-3xl" : "mb-8 text-4xl"
            } text-center ${
              touchCapable ? "active:text-blue-200" : "hover:text-blue-200"
            } transition-colors duration-200`}
          >
            Edit Profile
          </h1>

          <form
            onSubmit={handleSubmit}
            className={`${isMobile ? "space-y-4" : "space-y-6"}`}
          >
            {/* Name field */}
            <div className="relative">
              {isDesktop && (
                <FiUser
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              )}
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className={`w-full ${
                  isMobile
                    ? "py-3 px-4 text-base"
                    : isDesktop
                    ? "py-4 pl-12 pr-6 text-lg"
                    : "py-4 px-6 text-lg"
                } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                  touchCapable ? "touch-target" : ""
                }`}
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Email field */}
            <div className="relative">
              {isDesktop && (
                <FiMail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className={`w-full ${
                  isMobile
                    ? "py-3 px-4 text-base"
                    : isDesktop
                    ? "py-4 pl-12 pr-6 text-lg"
                    : "py-4 px-6 text-lg"
                } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                  touchCapable ? "touch-target" : ""
                }`}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={`w-full ${
                isMobile ? "py-3 px-4 text-base" : "py-4 px-6 text-lg"
              } rounded-lg bg-blue-600 ${
                touchCapable ? "active:bg-blue-700" : "hover:bg-blue-700"
              } text-white font-semibold shadow-lg transition-all duration-200 transform ${
                touchCapable ? "" : "hover:scale-105"
              } ${touchCapable ? "touch-target" : ""}`}
            >
              {confirmMode ? "Confirm?" : "Update Profile"}
            </button>

            {/* Message display */}
            {message && (
              <div
                className={`${
                  isMobile ? "mt-3 p-3 text-sm" : "mt-4 p-4 text-base"
                } rounded-lg text-center font-semibold ${
                  messageType === "success"
                    ? "bg-green-800 text-green-200 border border-green-700"
                    : "bg-red-800 text-red-200 border border-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
