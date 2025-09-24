import React from "react";

const AnimatedBackground = ({ animate = true }) => {
  // Create an array of circles with different properties, positioned only on left (0-25%) and right (75-100%) sides
  const circles = [
    { left: "5%", size: 80, delay: 0, duration: 22 },
    { left: "15%", size: 32, delay: 0.5, duration: 30 },
    { left: "20%", size: 30, delay: 1, duration: 24 },
    { left: "80%", size: 60, delay: 0, duration: 17 },
    { left: "85%", size: 40, delay: 0, duration: 22 },
    { left: "90%", size: 40, delay: 0.8, duration: 24 },
    { left: "10%", size: 30, delay: 1.5, duration: 22 },
    { left: "95%", size: 25, delay: 2, duration: 41 },
    { left: "2%", size: 35, delay: 0.3, duration: 32 },
    { left: "88%", size: 70, delay: 0, duration: 14 },
    { left: "12%", size: 50, delay: 1.2, duration: 19 },
    { left: "78%", size: 35, delay: 1.8, duration: 27 },
    { left: "22%", size: 32, delay: 2.5, duration: 32 },
    { left: "92%", size: 45, delay: 3, duration: 13 },
  ];

  const floatAnimation = `
    @keyframes floatUp {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
      }
      100% {
        transform: translateY(-1000px) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
      }
    }
  `;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{floatAnimation}</style>

      {/* Base Gray Background */}
      <div className="absolute inset-0 bg-gray-900"></div>

      {/* Pattern overlay on dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(240,240,240,0.05)_1.5px,_transparent_1px)] [background-size:30px_30px]"></div>

      {/* Animated Circles */}
      <div className="absolute inset-0">
        {circles.map((circle, index) => {
          // Calculate static positions for non-animated circles
          const staticPositions = [
            { top: "15%", bottom: "auto" },
            { top: "25%", bottom: "auto" },
            { top: "35%", bottom: "auto" },
            { top: "45%", bottom: "auto" },
            { top: "55%", bottom: "auto" },
            { top: "65%", bottom: "auto" },
            { top: "75%", bottom: "auto" },
            { top: "20%", bottom: "auto" },
            { top: "40%", bottom: "auto" },
            { top: "60%", bottom: "auto" },
            { top: "30%", bottom: "auto" },
            { top: "50%", bottom: "auto" },
            { top: "70%", bottom: "auto" },
            { top: "80%", bottom: "auto" },
          ];
          
          const staticPos = staticPositions[index] || { top: "50%", bottom: "auto" };
          
          return (
            <div
              key={index}
              className="absolute block bg-white/20"
              style={{
                left: circle.left,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                bottom: animate ? "-150px" : staticPos.bottom,
                top: animate ? "auto" : staticPos.top,
                animation: animate ? `floatUp ${circle.duration}s linear infinite` : "none",
                animationDelay: animate ? `${circle.delay}s` : "0s",
                opacity: animate ? 1 : 0.2,
                borderRadius: animate ? 0 : "50%",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBackground;
