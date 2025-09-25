import React, { useState, useEffect, useCallback } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiCalendar,
  FiMonitor,
  FiExternalLink,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Previews() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loadingAppDetails, setLoadingAppDetails] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchApps = useCallback(async () => {
    try {
      setLoadingApps(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apps`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, redirect to login
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch apps");
      }

      const data = await response.json();

      // Transform API data to match the component's expected format
      const transformedApps = data.apps.map((app) => ({
        _id: app.id,
        appName: app.name,
        description: app.description || "No description provided",
        status: app.status,
        createdAt: app.createdAt,
        requirementId: app.requirement?._id,
        requirementTitle: app.requirement?.title,
      }));

      setApps(transformedApps);
      setLoadingApps(false);
    } catch (error) {
      console.error("Error fetching apps:", error);
      setError("Failed to load your apps. Please try again.");
      setLoadingApps(false);
    }
  }, [navigate]);

  // Fetch user's apps from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated, fetchApps]);

  const deleteApp = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apps/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to delete app");
      }

      // Remove the deleted app from local state
      const updatedApps = apps.filter((app) => app._id !== id);
      setApps(updatedApps);
      setDeleteConfirm(null);
      setSuccessMessage("App deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting app:", error);
      setError("Failed to delete app. Please try again.");
      setDeleteConfirm(null);

      // Clear error message after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-500" />;
      case "generating":
        return <FiClock className="text-yellow-500 animate-spin" />;
      case "failed":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "generating":
        return "Generating";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openAppModal = async (appId) => {
    try {
      setLoadingAppDetails(true);
      setError(""); // Clear any error messages
      setSuccessMessage(""); // Clear any success messages
      setShowModal(true);
      setSelectedApp(null); // Clear previous app data

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoadingAppDetails(false);
        return;
      }

      // Fetch complete app data by ID
      const appResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apps/${appId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!appResponse.ok) {
        if (appResponse.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(
          `HTTP ${appResponse.status}: Failed to fetch app details`
        );
      }

      const appData = await appResponse.json();
      const app = appData.app;

      // Set the app data
      setSelectedApp({
        _id: app.id,
        appName: app.name,
        description: app.description,
        status: app.status,
        createdAt: app.createdAt,
        generatedCode: app.generatedCode?.code || "No code available.",
        requirement: app.requirement,
        errorMessage: app.errorMessage,
        metadata: app.metadata,
      });

      // Fetch requirement details if requirement exists
      if (app.requirement && app.requirement._id) {
        try {
          const requirementResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/requirements/${
              app.requirement._id
            }`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (requirementResponse.ok) {
            const requirementData = await requirementResponse.json();

            // Update selectedApp with complete requirement data
            setSelectedApp((prevApp) => ({
              ...prevApp,
              requirement: requirementData.data,
            }));
          } else if (requirementResponse.status === 401) {
            navigate("/login");
            return;
          } else {
            console.warn(
              `Failed to fetch requirement details: HTTP ${requirementResponse.status}`
            );
            // Don't throw error here, as app data is still valid without requirement details
          }
        } catch (fetchError) {
          console.error("Error fetching requirement details:", fetchError);
          // Don't set error here, as app data is still valid without requirement details
        }
      }

      setLoadingAppDetails(false);
    } catch (error) {
      console.error("Error opening app modal:", error);
      setError("Failed to load app details. Please try again.");
      setLoadingAppDetails(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
    setIsCodeExpanded(false);
    setIsCopied(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleCodeExpansion = () => {
    setIsCodeExpanded(!isCodeExpanded);
  };

  const viewApp = (appId) => {
    navigate(`/preview/${appId}`);
  };

  if (loading || loadingApps) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Applications
              </h1>
              <p className="text-gray-400">
                View generated application previews and demos
              </p>
            </div>{" "}
          </div>

          <hr className="border-gray-600 my-4" />

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {!loadingApps && apps.length === 0 ? (
            <div className="text-center py-12">
              <FiMonitor className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No apps found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't generated any applications yet. Create requirements
                and generate apps to see them here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <div
                  key={app._id}
                  onClick={() =>
                    app.status !== "failed" && openAppModal(app._id)
                  }
                  title={
                    app.status === "failed"
                      ? "App generation failed - Cannot preview"
                      : "Click to view details"
                  }
                  className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-colors duration-200 ${
                    app.status !== "failed"
                      ? "hover:border-gray-600 cursor-pointer"
                      : "cursor-not-allowed opacity-75"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {app.appName}
                        </h3>
                        {app.status != "failed" && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {app.description}
                          </p>
                        )}
                        {app.status === "failed" && (
                          <div className="text-xs border-red-400 bg-red-800/30 px-2 py-1 rounded-md mb-3">
                            Generation failed - Cannot access preview
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(app._id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Delete App"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        {formatDate(app.createdAt)}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          app.status === "completed"
                            ? "bg-green-900/80 text-green-200"
                            : app.status === "generating"
                            ? "bg-yellow-900/80 text-yellow-200"
                            : "bg-red-900/80 text-red-200"
                        }`}
                      >
                        {getStatusText(app.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Confirm Deletion
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this app? This action cannot
                  be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => deleteApp(deleteConfirm)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {loadingAppDetails ? (
                    // Loading State
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading app details...</p>
                      </div>
                      <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : selectedApp ? (
                    // App Content
                    <>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {selectedApp.appName}
                          </h2>
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusIcon(selectedApp.status)}
                            <span className="text-gray-400">
                              {getStatusText(selectedApp.status)}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">
                              {formatDate(selectedApp.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {selectedApp.status === "completed" && (
                            <button
                              onClick={() => viewApp(selectedApp._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                            >
                              <FiExternalLink className="mr-2" /> View Demo
                            </button>
                          )}
                          <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-white transition-colors duration-200"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Success and Error Messages */}
                      {successMessage && (
                        <div className="mb-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                          {successMessage}
                        </div>
                      )}
                      {error && (
                        <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      {/* Code */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-lg font-semibold text-white">
                            Generated Code
                          </label>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                selectedApp.generatedCode ||
                                  "No code available."
                              )
                            }
                            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                            title="Copy code to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <FiCheck className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                          {selectedApp.generatedCode &&
                          selectedApp.generatedCode !== "No code available." ? (
                            <div className="relative">
                              <SyntaxHighlighter
                                language="javascript"
                                style={vscDarkPlus}
                                customStyle={{
                                  margin: 0,
                                  padding: "16px",
                                  background: "transparent",
                                  fontSize: "14px",
                                  maxHeight: isCodeExpanded ? "none" : "200px",
                                  overflow: isCodeExpanded
                                    ? "visible"
                                    : "hidden",
                                }}
                                showLineNumbers={true}
                                wrapLines={true}
                              >
                                {selectedApp.generatedCode}
                              </SyntaxHighlighter>
                              {!isCodeExpanded &&
                                selectedApp.generatedCode.split("\n").length >
                                  8 && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-16 pointer-events-none"></div>
                                )}
                              {selectedApp.generatedCode.split("\n").length >
                                8 && (
                                <div className="border-t border-gray-700 bg-gray-800 px-4 py-2">
                                  <button
                                    onClick={toggleCodeExpansion}
                                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                                  >
                                    {isCodeExpanded ? (
                                      <>
                                        <FiChevronUp className="w-4 h-4" />
                                        <span>Show Less</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiChevronDown className="w-4 h-4" />
                                        <span>
                                          Show More (
                                          {
                                            selectedApp.generatedCode.split(
                                              "\n"
                                            ).length
                                          }{" "}
                                          lines)
                                        </span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4">
                              <p className="text-gray-400 text-center">
                                No code available.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requirements Details */}
                      {selectedApp.requirement &&
                        selectedApp.requirement.extractedRequirements && (
                          <div className="space-y-6 mt-6 pt-6 border-t border-gray-700">
                            {/* Requirement Features (if different from generated app features) */}
                            {selectedApp.requirement.extractedRequirements
                              .features &&
                              selectedApp.requirement.extractedRequirements
                                .features.length > 0 && (
                                <div>
                                  <label className="block text-lg font-semibold text-white mb-3">
                                    Required Features
                                  </label>
                                  <div className="space-y-3">
                                    {selectedApp.requirement.extractedRequirements.features.map(
                                      (feature, index) => (
                                        <div
                                          key={index}
                                          className="bg-gray-900 border border-gray-700 rounded-lg p-4"
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-white">
                                              {feature.title}
                                            </h4>
                                            <div className="flex space-x-2">
                                              {feature.category && (
                                                <span className="bg-gray-900/50 border border-gray-700 text-gray-200 text-xs px-2 py-1 rounded">
                                                  {feature.category}
                                                </span>
                                              )}
                                              {feature.userRole && (
                                                <span className="bg-gray-900/50 border border-gray-700 text-gray-200 text-xs px-2 py-1 rounded">
                                                  {feature.userRole}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-gray-300 mb-2">
                                            {feature.description}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Technical Requirements */}
                            {selectedApp.requirement.extractedRequirements
                              .technicalRequirements &&
                              selectedApp.requirement.extractedRequirements
                                .technicalRequirements.length > 0 && (
                                <div>
                                  <label className="block text-lg font-semibold text-white mb-3">
                                    Technical Requirements
                                  </label>
                                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                    <ul className="space-y-2">
                                      {selectedApp.requirement.extractedRequirements.technicalRequirements.map(
                                        (req, index) => (
                                          <li
                                            key={index}
                                            className="text-gray-300 flex items-start"
                                          >
                                            <span className="text-blue-400 mr-2 mt-1">
                                              •
                                            </span>
                                            <span>{req}</span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                    </>
                  ) : (
                    // Error State (when modal is shown but no app data and not loading)
                    <div className="text-center py-12">
                      <p className="text-red-400 mb-4">
                        Failed to load app details
                      </p>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Previews;
