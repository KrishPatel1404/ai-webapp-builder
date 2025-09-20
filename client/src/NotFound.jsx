import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center hover:text-blue-200 transition-colors duration-200">
          404 - Page Not Found
        </h1>

        <p className="text-gray-300 text-2xl text-center max-w-md">
          ¯\_(ツ)_/¯
        </p>

        <p className="text-gray-400 mt-3 text-center max-w-md">
          Sorry, the page you are looking for does not exist.
          <br />
          You can always go back to the homepage.
        </p>

        <Link
          to="/"
          className="mt-6 py-3 px-6 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors duration-200"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
