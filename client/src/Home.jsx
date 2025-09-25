import React, { useState, useEffect } from "react";
import {
  FiSend,
  FiInstagram,
  FiGithub,
  FiLinkedin,
  FiLoader,
  FiLink,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";
import DeviceInfo from "./components/DeviceInfo";
import { useAuth } from "./context/AuthContext";
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

function Home() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isMobile, isTablet, isDesktop, isHighDPI, isRetina, touchCapable } =
    useResponsive();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    setSearchText(target.value);

    // Clear error message when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateInput = () => {
    if (!searchText.trim()) {
      setError("Please enter a requirement description.");
      return false;
    }

    if (searchText.trim().length < 100) {
      setError("Requirement description must be at least 100 characters long.");
      return false;
    }

    if (searchText.length > 1500) {
      setError(
        "Requirement description is too long. Please limit to 1500 characters."
      );
      return false;
    }

    return true;
  };

  const handleSendClick = async () => {
    // Clear previous messages
    setError("");

    // Check authentication
    if (!isAuthenticated) {
      setError("You must be logged in to extract requirements.");
      return;
    }

    // Validate input
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: searchText.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Extracted requirements:", data.data);
        // Redirect to requirements page with new parameter
        navigate("/requirements?new=true");
      } else {
        setError(data.message || "Failed to extract requirements.");
      }
    } catch (error) {
      console.error("Error extracting requirements:", error);
      setError(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground animate={isDesktop} showIcons={true} />

      {/* Device Info (dev only) */}
      <DeviceInfo />

      {/* Navbar on top */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1
          className={`font-bold text-white mb-2 sm:mb-4 text-center transition-colors duration-200 ${
            isMobile
              ? isRetina
                ? "text-4xl"
                : isHighDPI
                ? "text-3xl"
                : "text-3xl"
              : isTablet
              ? "text-5xl"
              : "text-6xl"
          }`}
        >
          <ShuffleText duration={800}>Build your </ShuffleText>
          <span
            className={`text-blue-500 ${
              touchCapable ? "active:scale-95" : "hover:scale-105"
            } hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer inline-block`}
          >
            <ShuffleText duration={1200}>A.I App</ShuffleText>
          </span>
          <ShuffleText duration={800}> in Minutes</ShuffleText>
        </h1>
        <h2
          className={`pb-4 font-semibold text-blue-200 hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-400 hover:to-blue-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 ease-in-out cursor-pointer ${
            isMobile
              ? isRetina
                ? "text-xl"
                : isHighDPI
                ? "text-lg"
                : "text-lg"
              : isTablet
              ? "text-2xl"
              : "text-3xl"
          }`}
        >
          Create • Connect • Inspire
        </h2>

        <div
          className={`flex flex-col items-center gap-2 text-gray-400 ${
            isMobile ? "mb-6 text-sm" : "mb-10 text-base"
          }`}
        >
          Lorem ipsum dolor sit amet consectetur adipiscing elit.
        </div>

        {/* Input box */}
        <div
          className={`w-full ${
            isMobile ? "max-w-sm" : isTablet ? "max-w-xl" : "max-w-2xl"
          } relative ${error ? "animate-shake" : ""}`}
        >
          <textarea
            rows={isMobile ? (isRetina ? 2 : 2) : 1}
            placeholder={
              isMobile
                ? "Describe the website..."
                : "Describe the website you want..."
            }
            className={`w-full ${
              isMobile
                ? `${isRetina ? "py-4 px-5 pr-12" : "py-3 px-4 pr-10"} ${
                    isHighDPI ? "text-lg" : "text-base"
                  }`
                : "py-4 px-6 pr-12 text-lg"
            } rounded-2xl bg-gray-800 text-white border focus:outline-none shadow-lg transition-all duration-200 overflow-hidden resize-none ${
              touchCapable ? "touch-target" : ""
            } ${
              error
                ? "border-red-500/40"
                : "border-gray-700 focus:border-blue-500"
            }`}
            value={searchText}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            className={`absolute ${
              isMobile
                ? isRetina
                  ? "right-4 top-4"
                  : "right-3 top-3"
                : "right-4 top-1/2 transform -translate-y-1/2"
            } ${
              error ? "text-red-400/50" : "text-blue-500 hover:text-blue-300"
            } transition-colors duration-200 ${
              touchCapable ? "p-3" : "p-2"
            } disabled:opacity-50 disabled:cursor-not-allowed ${
              touchCapable ? "touch-target" : ""
            }`}
            onClick={handleSendClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader
                size={isMobile ? (isRetina ? 24 : 20) : 26}
                className="animate-spin"
              />
            ) : (
              <FiSend size={isMobile ? (isRetina ? 24 : 20) : 26} />
            )}
          </button>
        </div>

        {/* Character count */}
        <div
          className={`w-full ${
            isMobile ? "max-w-sm" : isTablet ? "max-w-xl" : "max-w-2xl"
          } mr-1`}
        >
          <p
            className={`${isMobile ? "text-xs" : "text-sm"} text-right ${
              searchText.length > 1500
                ? "text-red-400"
                : searchText.length < 100
                ? "text-gray-500"
                : "text-green-400"
            }`}
          >
            {searchText.length}/1500 characters
          </p>
        </div>

        {/* Error message */}
        <div
          className={`w-full ${
            isMobile ? "max-w-sm" : isTablet ? "max-w-xl" : "max-w-2xl"
          } transition-all duration-200 ${error ? "mt-3" : "mt-0"}`}
        >
          {error && (
            <div className="w-full mx-auto animate-fade-slide-down">
              <div
                className={`bg-red-900/20 border border-red-500/20 text-red-200 ${
                  isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"
                } rounded-lg transition-all duration-200`}
              >
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Text below - moves down when error appears */}
        <p
          className={`text-gray-400 text-center transition-all duration-200 ${
            isMobile ? "max-w-xs text-sm" : "max-w-md"
          } ${error ? "mt-4 mb-6" : "mt-2 mb-6"}`}
        >
          Lorem ipsum dolor sit amet consectetur adipiscing elit.{" "}
          {!isMobile &&
            "Dolor sit amet consectetur adipiscing elit quisque faucibus."}
        </p>
      </div>

      {/* Footer Section */}
      <div
        className={`${
          isMobile ? "pt-8 pb-4" : "pt-12 pb-4"
        } text-center relative bg-gradient-to-b from-transparent to-gray-900`}
      >
        <div
          className={`${
            isMobile
              ? "flex-col items-center space-y-3"
              : "flex justify-center space-x-4"
          } flex ${isMobile ? "" : "mt-4"}`}
        >
          <h1
            className={`${
              isMobile ? "text-sm" : "text-lg md:text-xl"
            } font-bold text-white ${isMobile ? "text-center" : ""}`}
          >
            {isMobile
              ? "100+ Lorem • 2000+ Lorem"
              : "100+ Lorem Ipsum Dolor • 2000+ Lorem Ipsum"}
          </h1>
          <div
            className={`flex justify-center ${
              isMobile ? "space-x-6 mt-2" : "space-x-4"
            }`}
          >
            <a
              href="https://www.instagram.com/krishpkreame/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiInstagram
                size={isMobile ? 20 : 24}
                className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
              />
            </a>
            <a
              href="https://github.com/KrishPatel1404"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub
                size={isMobile ? 20 : 24}
                className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/krish-patel-844834234"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin
                size={isMobile ? 20 : 24}
                className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
