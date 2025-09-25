import React from "react";

const AnimatedBackground = ({ animate = true, showIcons = false }) => {
  // Tech-related icons using emojis and symbols
  const appIcons = [
    "📱",
    "⚡",
    "💬",
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
    "☁️",
    "💰",
  ];

  // Create an array of app icons with different properties, positioned only on left (0-25%) and right (75-100%) sides
  const floatingApps = [
    { left: "5%", size: 90, delay: 0, duration: 22, icon: appIcons[0] },
    { left: "15%", size: 42, delay: 0.5, duration: 30, icon: appIcons[1] },
    { left: "20%", size: 40, delay: 1, duration: 24, icon: appIcons[2] },
    { left: "80%", size: 60, delay: 0, duration: 17, icon: appIcons[3] },
    { left: "85%", size: 50, delay: 0, duration: 22, icon: appIcons[4] },
    { left: "90%", size: 50, delay: 0.8, duration: 24, icon: appIcons[5] },
    { left: "10%", size: 40, delay: 1.5, duration: 22, icon: appIcons[6] },
    { left: "95%", size: 35, delay: 2, duration: 41, icon: appIcons[7] },
    { left: "2%", size: 45, delay: 0.3, duration: 32, icon: appIcons[8] },
    { left: "88%", size: 75, delay: 0, duration: 14, icon: appIcons[9] },
    { left: "12%", size: 60, delay: 1.2, duration: 19, icon: appIcons[10] },
    { left: "78%", size: 45, delay: 1.8, duration: 27, icon: appIcons[11] },
    { left: "22%", size: 42, delay: 2.5, duration: 32, icon: appIcons[12] },
    { left: "92%", size: 55, delay: 3, duration: 13, icon: appIcons[13] },
  ];

  const floatAnimation = `
    @keyframes floatUp {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 0.5;
      }
      50% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(-1000px) rotate(360deg) scale(0.5);
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
