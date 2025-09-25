import React from "react";
import { FiInfo, FiTarget, FiUsers, FiStar } from "react-icons/fi";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";
import { useResponsive } from "./hooks/useResponsive";

function About() {
  const { isMobile, isTablet, touchCapable } = useResponsive();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground animate={false} />

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow flex flex-col items-center justify-center px-4 ${
          isMobile ? "py-6" : "py-12"
        } relative z-10`}
      >
        <div
          className={`${
            isMobile ? "max-w-sm" : isTablet ? "max-w-3xl" : "max-w-4xl"
          } mx-auto text-center`}
        >
          {/* Header */}
          <div className={isMobile ? "mb-8" : "mb-12"}>
            <h1
              className={`font-bold text-white mb-4 ${
                isMobile ? "text-3xl" : isTablet ? "text-5xl" : "text-6xl"
              }`}
            >
              About{" "}
              <span
                className={`text-blue-500 ${
                  touchCapable ? "active:scale-95" : "hover:scale-105"
                } transition-all duration-200 inline-block`}
              >
                Me
              </span>
            </h1>
            <p
              className={`text-gray-300 ${
                isMobile
                  ? "text-lg max-w-xs"
                  : isTablet
                  ? "text-xl max-w-xl"
                  : "text-xl max-w-2xl"
              } mx-auto`}
            >
              Ullamco cillum id quis enim enim aliquip ut.
            </p>
          </div>

          {/* Feature Cards */}
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-6" : "md:grid-cols-3 gap-8"
            } ${isMobile ? "mb-6" : "mb-8"}`}
          >
            <div
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg ${
                isMobile ? "p-4" : "p-6"
              } ${
                touchCapable ? "active:bg-gray-700/50" : "hover:bg-gray-700/50"
              } transition-all duration-300`}
            >
              <FiTarget
                className="text-blue-500 mx-auto mb-4"
                size={isMobile ? 24 : 32}
              />
              <h3
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-semibold text-white mb-3`}
              >
                Point 1
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                Mollit duis magna duis reprehenderit elit sit. Laborum nulla
                aliquip commodo dolor mollit. Exercitation et qui nostrud minim.
              </p>
            </div>

            <div
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg ${
                isMobile ? "p-4" : "p-6"
              } ${
                touchCapable ? "active:bg-gray-700/50" : "hover:bg-gray-700/50"
              } transition-all duration-300`}
            >
              <FiUsers
                className="text-blue-500 mx-auto mb-4"
                size={isMobile ? 24 : 32}
              />
              <h3
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-semibold text-white mb-3`}
              >
                Point 2
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                Dolor mollit tempor amet reprehenderit eiusmod ipsum enim aute
                voluptate ea anim. Commodo occaecat cillum ut elit do. Proident
              </p>
            </div>

            <div
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg ${
                isMobile ? "p-4" : "p-6"
              } ${
                touchCapable ? "active:bg-gray-700/50" : "hover:bg-gray-700/50"
              } transition-all duration-300`}
            >
              <FiStar
                className="text-blue-500 mx-auto mb-4"
                size={isMobile ? 24 : 32}
              />
              <h3
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-semibold text-white mb-3`}
              >
                Point 3
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                Dolore culpa quis veniam eiusmod elit tempor fugiat eu duis
                cillum culpa sint laboris dolore. Tempor excepteur nulla non
              </p>
            </div>
          </div>

          {/* Description */}
          <div
            className={`bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg ${
              isMobile ? "p-4" : "p-8"
            } ${
              isMobile ? "max-w-sm" : isTablet ? "max-w-2xl" : "max-w-3xl"
            } mx-auto`}
          >
            <FiInfo
              className="text-blue-500 mx-auto mb-3"
              size={isMobile ? 24 : 32}
            />
            <h2
              className={`${
                isMobile ? "text-xl" : "text-2xl"
              } font-bold text-white mb-3`}
            >
              My Journey
            </h2>
            <p
              className={`${
                isMobile ? "text-base" : "text-lg"
              } text-gray-300 leading-relaxed mb-3`}
            >
              Deserunt veniam non pariatur minim pariatur eiusmod consectetur
              reprehenderit. Consequat elit quis eu nulla culpa laborum. Aute
              non qui mollit ut aliqua laboris consequat esse. Ex reprehenderit
            </p>
            <p
              className={`${
                isMobile ? "text-base" : "text-lg"
              } text-gray-300 leading-relaxed`}
            >
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
