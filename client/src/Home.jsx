import React, { useState } from "react";
import { FiSend, FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";
import Navbar from "./components/Navbar";

function Home() {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (e) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    setSearchText(target.value);
  };

  const handleSendClick = () => {
    console.log(searchText);
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
          Build your <span className="text-blue-500">AI Website</span> in
          Minutes
        </h1>
        <h2 className="text-4xl md:text-4xl pb-4 font-semibold text-blue-200">
          Create • Connect • Inspire
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-2 text-gray-400 mb-10">
          2.4 MILLION+ Sites have already been built
        </div>

        {/* Input box */}
        <div className="w-full max-w-2xl relative mb-4">
          <textarea
            rows={1}
            placeholder="Describe the website you want..."
            className="w-full py-4 px-6 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-lg shadow-lg transition-all duration-200 overflow-hidden resize-none"
            value={searchText}
            onChange={handleInputChange}
          />
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-300 transition-colors duration-200 p-2"
            onClick={handleSendClick}
          >
            <FiSend size={26} />
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-center max-w-md">
          Get access to our AI templates at zero cost — no design skill or
          copywriting experience required!
        </p>
      </div>

      {/* Footer Section */}
      <div className="pt-12 pb-4 text-center relative bg-gradient-to-b from-transparent to-gray-900">
        <div className="flex justify-center mt-4 space-x-4">
          <h1 className="text-lg md:text-xl font-bold text-white">
            2000+ AI Funnel Templates • 5000+ AI Templates
          </h1>
          <FiFacebook
            size={24}
            className="text-white hover:text-blue-400 cursor-pointer transition"
          />
          <FiTwitter
            size={24}
            className="text-white hover:text-blue-400 cursor-pointer transition"
          />
          <FiInstagram
            size={24}
            className="text-white hover:text-blue-400 cursor-pointer transition"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
