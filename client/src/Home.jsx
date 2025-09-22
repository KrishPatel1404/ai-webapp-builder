import React, { useState } from "react";
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
          Build your <span className="text-blue-500">A.I App</span> in Minutes
        </h1>
        <h2 className="text-4xl md:text-4xl pb-4 font-semibold text-blue-200">
          Create • Connect • Inspire
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-2 text-gray-400 mb-10">
          Lorem ipsum dolor sit amet consectetur adipiscing elit.
        </div>

        {/* Input box */}
        <div className="w-full max-w-2xl relative mb-4">
          <textarea
            rows={1}
            placeholder="Describe the website you want..."
            className="w-full py-4 px-6 pr-12 rounded-2xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200 overflow-hidden resize-none"
            value={searchText}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-300 transition-colors duration-200 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-full max-w-2xl mt-2">
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
        {error && (
          <div className="w-full max-w-2xl mt-4">
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <p className="text-gray-400 mb-6 mt-2 text-center max-w-md">
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
              className="text-white hover:text-blue-400 cursor-pointer transition"
            />
          </a>
          <a
            href="https://github.com/KrishPatel1404"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiGithub
              size={24}
              className="text-white hover:text-blue-400 cursor-pointer transition"
            />
          </a>
          <a
            href="www.linkedin.com/in/krish-patel-844834234"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiLinkedin
              size={24}
              className="text-white hover:text-blue-400 cursor-pointer transition"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
