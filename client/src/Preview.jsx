import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";
import { useResponsive } from "./hooks/useResponsive";

function Preview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("id");
  const { isAuthenticated, loading } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const iframeRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loadingApp, setLoadingApp] = useState(false);
  const [appData, setAppData] = useState(null);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  // Reset states when appId changes
  useEffect(() => {
    setAppData(null);
    setGeneratedCode("");
    setError(null);
    setHasFetched(false);
    setPreviewLoaded(false);
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

  // Auto-load preview when generatedCode is available
  useEffect(() => {
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
                body { 
                  margin: 0; 
                  padding: 16px; 
                  font-family: 'Roboto', sans-serif;
                  ${
                    isMobile
                      ? `
                    transform: scale(0.8);
                    transform-origin: top left;
                    width: 133.33%;
                    height: 133.33%;
                  `
                      : ""
                  }
                }
                * { box-sizing: border-box; }
                ${
                  isMobile
                    ? `
                  #root {
                    width: 100%;
                    min-height: 100vh;
                  }
                `
                    : ""
                }
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
        setPreviewLoaded(true);
      } catch (err) {
        console.error("Error loading preview:", err);
        setError("Failed to load preview. Please check the generated code.");
      }
    };

    if (generatedCode && iframeRef.current && !previewLoaded) {
      loadPreview();
    }
  }, [generatedCode, previewLoaded, isMobile]);

  if (loading || loadingApp) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
        {/* Animated Background */}
        <AnimatedBackground animate={false} />

        <div className="relative z-10">
          <Navbar />
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className={`${isMobile ? "text-lg" : "text-xl"} text-gray-300`}>
            {loading ? "Loading..." : "Loading app..."}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <AnimatedBackground animate={false} />

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Section */}
      <div
        className={`flex-1 flex flex-col ${
          isMobile ? "pt-4 px-4" : "pt-6 px-6"
        } relative z-10`}
      >
        {/* App Info */}
        {appData && (
          <div className="flex justify-center mb-4">
            <div
              className={`${
                isMobile ? "p-3 max-w-sm" : "p-3 max-w-md"
              } bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg`}
            >
              <p
                className={`${isMobile ? "text-xs" : "text-sm"} text-gray-400`}
              >
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
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-red-400 mt-2`}
                >
                  Error: {appData.errorMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center mb-4">
            <div
              className={`${
                isMobile ? "p-3 max-w-sm" : "p-4 max-w-2xl"
              } bg-red-900/50 border border-red-700 rounded-lg`}
            >
              <p
                className={`${isMobile ? "text-base" : "text-lg"} text-red-300`}
              >
                Error: {error}
              </p>
            </div>
          </div>
        )}

        {/* No Code Message */}
        {(!generatedCode || !appData || appData.status !== "completed") &&
          !error &&
          !loadingApp && (
            <div className="flex justify-center items-center flex-1">
              <div
                className={`${
                  isMobile ? "p-4 max-w-sm" : "p-6 max-w-2xl"
                } bg-yellow-900/50 border border-yellow-700 rounded-lg text-center`}
              >
                <p
                  className={`${
                    isMobile ? "text-base" : "text-lg"
                  } text-yellow-300 mb-2`}
                >
                  {appData && appData.status !== "completed"
                    ? `App is ${appData.status}. Preview not available yet.`
                    : "No generated code available for this app."}
                </p>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-gray-400`}
                >
                  {appData && appData.status !== "completed"
                    ? "Please wait for the app generation to complete."
                    : "Please check if the app has been generated successfully."}
                </p>
              </div>
            </div>
          )}

        {/* Preview iframe */}
        {generatedCode &&
          !error &&
          appData &&
          appData.status === "completed" && (
            <div
              className={`flex-1 flex flex-col ${isMobile ? "pb-4" : "pb-6"}`}
            >
              {!previewLoaded && (
                <div
                  className={`flex-1 ${
                    isMobile ? "max-w-sm h-64" : "max-w-5xl h-96"
                  } mx-auto w-full relative bg-blue-900/50 border border-blue-700 rounded-lg flex items-center justify-center`}
                >
                  <p
                    className={`text-blue-300 animate-pulse ${
                      isMobile ? "text-sm" : "text-base"
                    }`}
                  >
                    Loading preview...
                  </p>
                </div>
              )}
              <div
                className={`flex-1 ${
                  isMobile ? "max-w-full" : isTablet ? "max-w-5xl" : "max-w-7xl"
                } mx-auto w-full relative`}
              >
                <iframe
                  ref={iframeRef}
                  title="App Preview"
                  className="absolute inset-0 w-full h-full border border-gray-700 rounded-lg bg-white"
                  aria-label="Application preview"
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default Preview;
