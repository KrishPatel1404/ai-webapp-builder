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
                This App
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
              Turning ideas into fast, simple, and inspiring apps.
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
                Describe An Idea
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                Start with a simple description about the app you want to create
                and any ideas or features you have in mind.
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
                Capture Requirements
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                An AI will break down your description into requirements,
                features, and roles. Which you can then edit and refine.
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
                Instant Mock-UI
              </h3>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                See your idea come to life with automatically generated forms,
                menus, and role-based views in a AI generated mockup.
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
              I've always been fascinated by how ideas can turn into real
              applications. But I noticed that many students, creators and even
              developers often get stuck at the very first step
            </p>
            <p
              className={`${
                isMobile ? "text-base" : "text-lg"
              } text-blue-200 leading-relaxed mb-3`}
            >
              Translating an idea into a structured app design!
            </p>
            <p
              className={`${
                isMobile ? "text-base" : "text-lg"
              } text-gray-300 leading-relaxed mb-3`}
            >
              That's why I created this project. It combines my interest in AI
              and software development with a mission: make prototyping
              effortless. Instead of spending hours coding the basics, you can
              focus on what really matters the idea itself and see your vision
              as a mockup.
            </p>
            <p
              className={`${
                isMobile ? "text-base" : "text-lg"
              } text-gray-300 leading-relaxed`}
            >
              This project and my journey has been about learning how to merge
              AI with development tools, and about building something that makes
              the creative process more accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
