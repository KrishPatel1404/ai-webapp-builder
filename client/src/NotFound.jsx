import { Link } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground";
import { useResponsive } from "./hooks/useResponsive";

const NotFound = () => {
  const { isMobile, isDesktop, touchCapable } = useResponsive();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground animate={isDesktop} />

      {/* Main content */}
      <div
        className={`flex-grow flex flex-col items-center justify-center px-4 relative z-10 ${
          isMobile ? "py-6" : "py-8"
        }`}
      >
        <h1
          className={`font-bold text-white ${
            isMobile ? "mb-4 text-3xl" : "mb-6 text-4xl md:text-5xl"
          } text-center ${
            touchCapable ? "active:text-blue-200" : "hover:text-blue-200"
          } transition-colors duration-200`}
        >
          404 - Page Not Found
        </h1>

        <p
          className={`text-gray-300 ${
            isMobile ? "text-xl" : "text-2xl"
          } text-center ${isMobile ? "max-w-xs" : "max-w-md"}`}
        >
          ¯\_(ツ)_/¯
        </p>

        <p
          className={`text-gray-400 ${
            isMobile ? "mt-2 text-sm max-w-xs" : "mt-3 text-base max-w-md"
          } text-center`}
        >
          Sorry, the page you are looking for does not exist.
          <br />
          You can always go back to the homepage.
        </p>

        <Link
          to="/"
          className={`${
            isMobile ? "mt-4 py-2 px-4 text-sm" : "mt-6 py-3 px-6 text-base"
          } rounded-lg bg-blue-500 text-white font-semibold ${
            touchCapable ? "active:bg-blue-600" : "hover:bg-blue-600"
          } transition-colors duration-200 ${
            touchCapable ? "touch-target" : ""
          }`}
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
