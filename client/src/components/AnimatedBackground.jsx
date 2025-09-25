import React from "react";

const AnimatedBackground = ({ animate = true, showIcons = false }) => {
  // Tech-related icons using emojis and symbols
  const appIcons = [
    "📱",
    "⚡",
    "☁️",
    "🌐",
    "📷",
    "🖥️",
    "🎵",
    "📺",
    "⚙️",
    "🛠️",
    "💾",
    "🎮",
    "📺",
    "🔒",
  ];

  // Create an array of app icons with randomized bubble-like properties
  const floatingApps = [
    { left: "3%", size: 28, delay: -2.3, duration: 18, icon: appIcons[8] },
    { left: "8%", size: 52, delay: 0.3, duration: 25, icon: appIcons[0] },
    { left: "14%", size: 35, delay: 2.1, duration: 31, icon: appIcons[10] },
    { left: "11%", size: 44, delay: -2.8, duration: 20, icon: appIcons[6] },
    { left: "18%", size: 38, delay: -1.4, duration: 28, icon: appIcons[1] },
    { left: "23%", size: 32, delay: 1.4, duration: 22, icon: appIcons[2] },
    { left: "6%", size: 48, delay: 3.8, duration: 35, icon: appIcons[12] },
    { left: "77%", size: 41, delay: -2.1, duration: 24, icon: appIcons[11] },
    { left: "82%", size: 55, delay: 3.7, duration: 19, icon: appIcons[3] },
    { left: "86%", size: 33, delay: 2.1, duration: 29, icon: appIcons[4] },
    { left: "91%", size: 47, delay: 1.5, duration: 16, icon: appIcons[9] },
    { left: "81%", size: 33, delay: -1.6, duration: 19, icon: appIcons[0] },
    { left: "94%", size: 37, delay: 0.9, duration: 21, icon: appIcons[6] },
    { left: "89%", size: 39, delay: 2.4, duration: 27, icon: appIcons[5] },
    { left: "94%", size: 36, delay: 1.2, duration: 33, icon: appIcons[13] },
    { left: "79%", size: 29, delay: 3.1, duration: 21, icon: appIcons[7] },
    { left: "16%", size: 42, delay: 4.1, duration: 26, icon: appIcons[3] },
    { left: "4%", size: 31, delay: 4.9, duration: 30, icon: appIcons[9] },
    { left: "87%", size: 45, delay: -0.9, duration: 23, icon: appIcons[1] },
    { left: "21%", size: 37, delay: 5.5, duration: 34, icon: appIcons[6] },
  ];

  const floatAnimation = `
    @keyframes floatUp {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
        opacity: 0.4;
      }
      25% {
        transform: translateY(-250px) translateX(15px) rotate(90deg) scale(0.9);
        opacity: 0.7;
      }
      50% {
        transform: translateY(-500px) translateX(-10px) rotate(180deg) scale(1);
        opacity: 0.8;
      }
      75% {
        transform: translateY(-750px) translateX(20px) rotate(270deg) scale(0.7);
        opacity: 0.6;
      }
      100% {
        transform: translateY(-1000px) translateX(0) rotate(360deg) scale(0.4);
        opacity: 0;
      }
    }
  `;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {animate && <style>{floatAnimation}</style>}

      {/* Base Gray Background */}
      <div className="absolute inset-0 bg-gray-900"></div>

      {/* Pattern overlay on dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(240,240,240,0.05)_1.5px,_transparent_1px)] [background-size:30px_30px]"></div>

      {/* Animated App Icons */}
      {animate && (
        <div className="absolute inset-0">
          {floatingApps.map((app, index) => (
            <div
              key={index}
              className="absolute flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
              style={{
                left: app.left,
                width: `${app.size}px`,
                height: `${app.size}px`,
                bottom: "-150px",
                animation: `floatUp ${app.duration}s linear infinite`,
                animationDelay: `${app.delay}s`,
                fontSize: `${app.size * 0.6}px`,
              }}
            >
              {showIcons ? app.icon : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedBackground;
