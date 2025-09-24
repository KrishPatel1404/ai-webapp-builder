import React from "react";
import { FiInfo, FiTarget, FiUsers, FiStar } from "react-icons/fi";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";

function About() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground animate={false} />

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              About <span className="text-blue-500">Me</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ullamco cillum id quis enim enim aliquip ut.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300">
              <FiTarget className="text-blue-500 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-3">Point 1</h3>
              <p className="text-gray-400">
                Mollit duis magna duis reprehenderit elit sit. Laborum nulla
                aliquip commodo dolor mollit. Exercitation et qui nostrud minim.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300">
              <FiUsers className="text-blue-500 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-3">Point 2</h3>
              <p className="text-gray-400">
                Dolor mollit tempor amet reprehenderit eiusmod ipsum enim aute
                voluptate ea anim. Commodo occaecat cillum ut elit do. Proident
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300">
              <FiStar className="text-blue-500 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-semibold text-white mb-3">Point 3</h3>
              <p className="text-gray-400">
                Dolore culpa quis veniam eiusmod elit tempor fugiat eu duis
                cillum culpa sint laboris dolore. Tempor excepteur nulla non
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg p-8 max-w-3xl mx-auto">
            <FiInfo className="text-blue-500 mx-auto mb-3" size={32} />
            <h2 className="text-2xl font-bold text-white mb-3">My Journey</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-3">
              Deserunt veniam non pariatur minim pariatur eiusmod consectetur
              reprehenderit. Consequat elit quis eu nulla culpa laborum. Aute
              non qui mollit ut aliqua laboris consequat esse. Ex reprehenderit
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Cillum laboris occaecat exercitation officia nostrud adipisicing
              laborum ad tempor pariatur labore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
