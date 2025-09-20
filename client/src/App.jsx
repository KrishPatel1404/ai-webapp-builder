import React, { useState } from "react";
import { FiSend, FiInfo, FiMail, FiUser } from "react-icons/fi";

function App() {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSendClick = () => {
    console.log(searchText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendClick();
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img
              src="/src/assets/logo.webp"
              alt="Logo"
              className="h-8 hover:scale-105 transition-transform duration-200"
            />
            <span className="sr-only">Home</span>
          </a>
          <div className="flex space-x-8">
            <a
              href="#"
              className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
            >
              <FiInfo className="mr-1" /> About
            </a>
            <a
              href="#"
              className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
            >
              <FiMail className="mr-1" /> Contact
            </a>
            <a
              href="#"
              className="flex items-center text-xl text-gray-200 hover:text-blue-300 transition-colors duration-200"
            >
              <FiUser className="mr-1" /> Login
            </a>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center hover:text-blue-200 transition-colors duration-200">
          Find what you're looking for
        </h1>

        {/* Search input */}
        <div className="w-full max-w-2xl relative">
          <input
            type="text"
            placeholder="Search for anything..."
            className="w-full py-4 px-6 pr-12 rounded-full bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
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

export default App;
