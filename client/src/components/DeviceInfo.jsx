import React from "react";
import { useResponsive } from "../hooks/useResponsive";

const DeviceInfo = () => {
  const screenSize = useResponsive();

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg z-50 font-mono">
      <div className="space-y-1">
        <div>
          Screen: {screenSize.width}x{screenSize.height}
        </div>
        <div>DPR: {screenSize.pixelRatio}x</div>
        <div>Type: {screenSize.deviceType}</div>
        <div>
          {screenSize.isMobile && "📱"}
          {screenSize.isTablet && "📟"}
          {screenSize.isDesktop && "💻"}
          {screenSize.isRetina && " ✨Retina"}
          {screenSize.isHighDPI && " 🔍HighDPI"}
          {screenSize.touchCapable && " 👆Touch"}
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;
