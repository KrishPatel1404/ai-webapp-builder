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
import { useAuth } from "./context/AuthContext";

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
          <ShuffleText duration={800}>Build your </ShuffleText>
          <span className="text-blue-500 hover:scale-107 hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer inline-block">
            <ShuffleText duration={1200}>A.I App</ShuffleText>
          </span>
          <ShuffleText duration={800}> in Minutes</ShuffleText>
        </h1>
        <h2 className="text-3xl md:text-3xl pb-4 font-semibold text-blue-200 hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-400 hover:to-blue-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 ease-in-out cursor-pointer">
          Create • Connect • Inspire
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-2 text-gray-400 mb-10">
          Lorem ipsum dolor sit amet consectetur adipiscing elit.
        </div>

        {/* Input box */}
        <div
          className={`w-full max-w-2xl relative ${
            error ? "animate-shake" : ""
          }`}
        >
          <textarea
            rows={1}
            placeholder="Describe the website you want..."
            className={`w-full py-4 px-6 pr-12 rounded-2xl bg-gray-800 text-white border focus:outline-none text-lg shadow-lg transition-all duration-200 overflow-hidden resize-none ${
              error
                ? "border-red-500/40"
                : "border-gray-700 focus:border-blue-500"
            }`}
            value={searchText}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
              error ? "text-red-400/50" : "text-blue-500 hover:text-blue-300"
            } transition-colors duration-200 p-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleSendClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader size={26} className="animate-spin" />
            ) : (
              <FiSend size={26} />
            )}
          </button>
        </div>

        {/* Character count */}
        <div className="w-full max-w-2xl mr-1">
          <p
            className={`text-sm text-right ${
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
          className={`w-full max-w-2xl transition-all duration-200 ${
            error ? "mt-4" : "mt-0"
          }`}
        >
          {error && (
            <div className="w-full max-w-xl mx-auto animate-fade-slide-down">
              <div className="bg-red-900/20 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg transition-all duration-200">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Text below - moves down when error appears */}
        <p
          className={`text-gray-400 text-center max-w-md transition-all duration-200 ${
            error ? "mt-4 mb-6" : "mt-2 mb-6"
          }`}
        >
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet
          consectetur adipiscing elit quisque faucibus.
        </p>
      </div>

      {/* Footer Section */}
      <div className="pt-12 pb-4 text-center relative bg-gradient-to-b from-transparent to-gray-900">
        <div className="flex justify-center mt-4 space-x-4">
          <h1 className="text-lg md:text-xl font-bold text-white">
            100+ Lorem Ipsum Dolor • 2000+ Lorem Ipsum
          </h1>
          <a
            href="https://www.instagram.com/krishpkreame/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiInstagram
              size={24}
              className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
            />
          </a>
          <a
            href="https://github.com/KrishPatel1404"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiGithub
              size={24}
              className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/krish-patel-844834234"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiLinkedin
              size={24}
              className="text-white hover:text-blue-400 hover:scale-110 hover:-translate-y-1 cursor-pointer transition"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
