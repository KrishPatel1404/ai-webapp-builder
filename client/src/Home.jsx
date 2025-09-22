import React, { useState } from "react";
import { FiSend, FiLoader } from "react-icons/fi";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

function Home() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleInputChange = (e) => {
    const target = e.target;
    // reset height to auto to correctly calculate scrollHeight
    target.style.height = "auto";
    // set height based on scrollHeight for auto-resizing
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
    setSuccess("");

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
        setSuccess("Requirements extracted successfully!");
        setSearchText(""); // Clear the input on success
        console.log("Extracted requirements:", data.data);
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
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center hover:text-blue-200 transition-colors duration-200">
          Extract Software Requirements
        </h1>

        {/* Search input */}
        <div className="w-full max-w-2xl relative">
          <textarea
            rows={1}
            placeholder="Describe your software requirements..."
            className="w-full py-4 px-6 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200 overflow-hidden resize-none"
            value={searchText}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 p-2 ${
              isLoading
                ? "text-gray-500 cursor-not-allowed"
                : "text-gray-400 hover:text-blue-400"
            }`}
            onClick={handleSendClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader size={20} className="animate-spin" />
            ) : (
              <FiSend size={20} />
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

        {/* Success message */}
        {success && (
          <div className="w-full max-w-2xl mt-4">
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          </div>
        )}

        <p className="text-gray-400 mt-6 text-center max-w-md">
          Enter your software requirements above and hit send to extract
          structured requirements using AI
        </p>
      </div>
    </div>
  );
}

export default Home;
