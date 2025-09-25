import React, { useState, useEffect } from "react";
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
import { useResponsive } from "./hooks/useResponsive";

// Custom hook for text shuffle effect
const useTextShuffle = (finalText, duration = 2000) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let iteration = 0;
    const totalIterations = Math.floor(duration / 50);

    const interval = setInterval(() => {
      setDisplayText(
        finalText
          .split("")
          .map((letter, index) => {
            if (letter === " ") return " ";

            if (iteration > index * (totalIterations / finalText.length)) {
              return finalText[index];
            }

            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      iteration++;

      if (iteration > totalIterations) {
        setDisplayText(finalText);
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [finalText, duration]);

  return { displayText, isComplete };
};

// Text shuffle component
const ShuffleText = ({ children, className, duration = 2000 }) => {
  const text = typeof children === "string" ? children : "";
  const { displayText, isComplete } = useTextShuffle(text, duration);

  if (typeof children !== "string") {
    return <span className={className}>{children}</span>;
  }
  return (
    <span className={className}>
      {displayText.split("").map((char, index) => (
        <span
          key={index}
          className={
            char === " " ? "" : !isComplete ? "font-mono" : "font-mono"
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isMobile, isTablet, isDesktop, touchCapable } = useResponsive();
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
      <AnimatedBackground animate={isDesktop} />

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

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
            {isSignup ? (
              "Create Account"
            ) : (
              <ShuffleText duration={1000}>Welcome Back</ShuffleText>
            )}
          </h1>

          <form
            onSubmit={handleSubmit}
            className={`${isMobile ? "space-y-4" : "space-y-6"}`}
          >
            {/* Name field (only for signup) */}
            {isSignup && (
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={isMobile ? 18 : 20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required={isSignup}
                  className={`w-full ${
                    isMobile
                      ? "py-3 pl-10 pr-4 text-base"
                      : "py-4 pl-12 pr-6 text-lg"
                  } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                    touchCapable ? "touch-target" : ""
                  }`}
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={isMobile ? 18 : 20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className={`w-full ${
                  isMobile
                    ? "py-3 pl-10 pr-4 text-base"
                    : "py-4 pl-12 pr-6 text-lg"
                } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                  touchCapable ? "touch-target" : ""
                }`}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <FiLock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={isMobile ? 18 : 20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                className={`w-full ${
                  isMobile
                    ? "py-3 pl-10 pr-10 text-base"
                    : "py-4 pl-12 pr-12 text-lg"
                } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                  touchCapable ? "touch-target" : ""
                }`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className={`absolute ${
                  isMobile ? "right-3" : "right-4"
                } top-1/2 transform -translate-y-1/2 text-gray-400 ${
                  touchCapable ? "active:text-blue-400" : "hover:text-blue-400"
                } transition-colors duration-200 ${
                  touchCapable ? "p-2" : "p-1"
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff size={isMobile ? 18 : 20} />
                ) : (
                  <FiEye size={isMobile ? 18 : 20} />
                )}
              </button>
            </div>

            {/* Confirm Password field (only for signup) */}
            {isSignup && (
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={isMobile ? 18 : 20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required={isSignup}
                  className={`w-full ${
                    isMobile
                      ? "py-3 pl-10 pr-4 text-base"
                      : "py-4 pl-12 pr-6 text-lg"
                  } rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200 ${
                    touchCapable ? "touch-target" : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isMobile ? "py-3 px-4 text-base" : "py-4 px-6 text-lg"
              } rounded-lg bg-blue-600 ${
                touchCapable ? "active:bg-blue-700" : "hover:bg-blue-700"
              } disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold shadow-lg transition-all duration-200 transform ${
                touchCapable ? "" : "hover:scale-105"
              } disabled:hover:scale-100 flex items-center justify-center gap-2 ${
                touchCapable ? "touch-target" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <FiLoader
                    className="animate-spin"
                    size={isMobile ? 18 : 20}
                  />
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
          <p
            className={`text-gray-400 ${
              isMobile ? "mt-4 text-sm" : "mt-6 text-base"
            } text-center`}
          >
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleMode}
              className={`text-blue-400 ${
                touchCapable ? "active:text-blue-300" : "hover:text-blue-300"
              } transition-colors duration-200 font-semibold ${
                touchCapable ? "touch-target" : ""
              }`}
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
