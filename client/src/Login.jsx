import React, { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignup && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignup
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        : { email: formData.email, password: formData.password };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`${isSignup ? "Signup" : "Login"} successful:`, data);
        login(data.token, data.user);
        // Redirect to main app or dashboard
        navigate("/");
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-white mb-8 text-center hover:text-blue-200 transition-colors duration-200">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (only for signup) */}
            {isSignup && (
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required={isSignup}
                  className="w-full py-4 pl-12 pr-6 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full py-4 pl-12 pr-6 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <FiLock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                className="w-full py-4 pl-12 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Confirm Password field (only for signup) */}
            {isSignup && (
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required={isSignup}
                  className="w-full py-4 pl-12 pr-6 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" size={20} />
                  Loading...
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <p className="text-gray-400 mt-6 text-center">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
