import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import Navbar from "./components/Navbar";

function Home() {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (e) => {
    const target = e.target;
    // reset height to auto to correctly calculate scrollHeight
    target.style.height = "auto";
    // set height based on scrollHeight for auto-resizing
    target.style.height = `${target.scrollHeight}px`;
    setSearchText(target.value);
  };

  const handleSendClick = () => {
    console.log(searchText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center hover:text-blue-200 transition-colors duration-200">
          Find what you're looking for
        </h1>

        {/* Search input */}
        <div className="w-full max-w-2xl relative">
          <textarea
            rows={1}
            placeholder="Search for anything..."
            className="w-full py-4 px-6 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200 overflow-hidden resize-none"
            value={searchText}
            onChange={handleInputChange}
          />
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
            onClick={handleSendClick}
          >
            <FiSend size={20} />
          </button>
        </div>

        <p className="text-gray-400 mt-6 text-center max-w-md">
          Enter your query above and hit send to discover amazing results
        </p>
      </div>
    </div>
  );
}

export default Home;
