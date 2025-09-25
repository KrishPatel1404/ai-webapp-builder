import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function Preview() {
  const navigate = useNavigate();
  const { id: appId } = useParams();
  const { isAuthenticated, loading } = useAuth();

  const iframeRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loadingApp, setLoadingApp] = useState(false);
  const [appData, setAppData] = useState(null);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Reset states when appId changes
  useEffect(() => {
    setAppData(null);
    setGeneratedCode("");
    setError(null);
    setHasFetched(false);
  }, [appId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch app data and generated code using the app ID
  useEffect(() => {
    const fetchAppData = async () => {
      // Add additional checks to prevent unnecessary calls
      if (!appId || !isAuthenticated || loading || hasFetched) return;

      setLoadingApp(true);
      setError(null);
      setHasFetched(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/apps/${appId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch app: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.app) {
          setAppData(data.app);

          // Extract the generated code
          if (data.app.generatedCode && data.app.generatedCode.code) {
            setGeneratedCode(data.app.generatedCode.code);
          } else {
            setError("No generated code found for this app");
          }
        } else {
          setError("Failed to load app data");
        }
      } catch (err) {
        console.error("Error fetching app data:", err);
        setError(err.message || "Failed to fetch app data");
      } finally {
        setLoadingApp(false);
      }
    };

    // Only fetch if we haven't already fetched and auth is stable
    if (!loading && isAuthenticated && appId && !hasFetched) {
      fetchAppData();
    }
  }, [appId, isAuthenticated, loading, hasFetched]);

  const loadPreview = () => {
    if (!iframeRef.current || !generatedCode) return;

    try {
      const doc = iframeRef.current.contentDocument;

      doc.open();
      doc.write(`
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@mui/material@5.15.0/umd/material-ui.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
              body { margin: 0; padding: 16px; font-family: 'Roboto', sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel" data-presets="react">
              ${generatedCode}
            </script>
          </body>
        </html>
      `);
      doc.close();
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Failed to load preview. Please check the generated code.");
    }
  };

  if (loading || loadingApp) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(240,240,240,0.05)_1.5px,_transparent_1px)] [background-size:30px_30px]"></div>
        </div>
        <div className="relative z-10">
          <Navbar />
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-gray-300">
            {loading ? "Loading..." : "Loading app..."}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(240,240,240,0.05)_1.5px,_transparent_1px)] [background-size:30px_30px]"></div>
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          App Preview
        </h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg max-w-2xl">
            <p className="text-lg text-red-300">
              <span className="text-red-400 font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* App Info */}
        {appData && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg max-w-2xl">
            <h2 className="text-xl text-white font-semibold mb-2">
              {appData.name}
            </h2>
            {appData.description && (
              <p className="text-gray-300 mb-2">{appData.description}</p>
            )}
            <p className="text-sm text-gray-400">
              <span className="text-blue-400 font-semibold">Status:</span>{" "}
              <span
                className={`capitalize ${
                  appData.status === "completed"
                    ? "text-green-400"
                    : appData.status === "failed"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {appData.status}
              </span>
            </p>
            {appData.errorMessage && (
              <p className="text-sm text-red-400 mt-1">
                {appData.errorMessage}
              </p>
            )}
          </div>
        )}

        {/* Preview Controls */}
        {generatedCode && !error && (
          <button
            onClick={loadPreview}
            className="px-6 py-3 mb-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Load Preview
          </button>
        )}

        {/* No Code Message */}
        {!generatedCode && !error && !loadingApp && (
          <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg max-w-2xl">
            <p className="text-lg text-yellow-300">
              No generated code available for this app.
            </p>
          </div>
        )}

        {/* Preview iframe */}
        {generatedCode && !error && (
          <div className="w-full max-w-6xl">
            <iframe
              ref={iframeRef}
              title="App Preview"
              className="w-full h-[600px] border border-gray-700 rounded-lg bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;
