import React, { useState, useEffect, useCallback } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiCalendar,
  FiMonitor,
  FiExternalLink,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function Previews() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [previews, setPreviews] = useState([]);
  const [loadingPreviews, setLoadingPreviews] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchApps = useCallback(async () => {
    try {
      setLoadingPreviews(true);
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
        technologies: extractTechnologies(
          app.requirement?.extractedRequirements
        ),
        features: extractFeatures(app.requirement?.extractedRequirements),
      }));

      setPreviews(transformedApps);
      setLoadingPreviews(false);
    } catch (error) {
      console.error("Error fetching apps:", error);
      setError("Failed to load your apps. Please try again.");
      setLoadingPreviews(false);
    }
  }, [navigate]);

  // Helper function to extract technologies from requirements
  const extractTechnologies = (extractedRequirements) => {
    if (!extractedRequirements) return [];

    const techs = [];
    if (extractedRequirements.technicalRequirements) {
      techs.push(...extractedRequirements.technicalRequirements);
    }
    if (extractedRequirements.frontend) {
      techs.push(extractedRequirements.frontend);
    }
    if (extractedRequirements.backend) {
      techs.push(extractedRequirements.backend);
    }
    if (extractedRequirements.database) {
      techs.push(extractedRequirements.database);
    }

    return [...new Set(techs)].slice(0, 5); // Remove duplicates and limit to 5
  };

  // Helper function to extract features from requirements
  const extractFeatures = (extractedRequirements) => {
    if (!extractedRequirements) return [];

    const features = [];
    if (
      extractedRequirements.features &&
      Array.isArray(extractedRequirements.features)
    ) {
      features.push(...extractedRequirements.features);
    }
    if (
      extractedRequirements.functionalRequirements &&
      Array.isArray(extractedRequirements.functionalRequirements)
    ) {
      features.push(...extractedRequirements.functionalRequirements);
    }

    return features.slice(0, 5); // Limit to 5 features
  };

  // Fetch user's apps from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated, fetchApps]);

  const deletePreview = async (id) => {
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
      const updatedPreviews = previews.filter((prev) => prev._id !== id);
      setPreviews(updatedPreviews);
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

  const openModal = async (preview) => {
    try {
      setSelectedPreview(preview);
      setError(""); // Clear any error messages
      setSuccessMessage(""); // Clear any success messages
      setShowModal(true);

      // Fetch requirement details if requirement ID exists
      if (preview.requirementId) {
        const token = localStorage.getItem("token");

        // Fetch apps by requirement ID and requirement details in parallel
        const [appsResponse, requirementResponse] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL}/api/apps/requirement/${
              preview.requirementId
            }`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/requirements/${
              preview.requirementId
            }`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

        if (requirementResponse.ok) {
          const requirementData = await requirementResponse.json();
          // Update selectedPreview with complete requirement data
          setSelectedPreview({
            ...preview,
            requirement: requirementData.data,
          });
        }

        // Optional: You can also use the apps data if needed
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          console.log("Related apps:", appsData); // For debugging
        }
      }
    } catch (error) {
      console.error("Error fetching requirement details:", error);
      setError("Failed to load requirement details");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPreview(null);
  };

  const viewPreview = (previewId) => {
    navigate(`/preview/${previewId}`);
  };

  if (loading || loadingPreviews) {
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
                App Previews
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

          {!loadingPreviews && previews.length === 0 ? (
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
              {previews.map((preview) => (
                <div
                  key={preview._id}
                  onClick={() =>
                    preview.status !== "failed" && openModal(preview)
                  }
                  title={
                    preview.status === "failed"
                      ? "App generation failed - Cannot preview"
                      : "Click to view details"
                  }
                  className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-colors duration-200 ${
                    preview.status !== "failed"
                      ? "hover:border-gray-600 cursor-pointer"
                      : "cursor-not-allowed opacity-75"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {preview.appName}
                        </h3>
                        {preview.status != "failed" && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {preview.description}
                          </p>
                        )}
                        {preview.status === "failed" && (
                          <div className="text-xs border-red-400 bg-red-800/30 px-2 py-1 rounded-md mb-3">
                            Generation failed - Cannot access preview
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(preview._id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Delete Preview"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        {formatDate(preview.createdAt)}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          preview.status === "completed"
                            ? "bg-green-900/80 text-green-200"
                            : preview.status === "generating"
                            ? "bg-yellow-900/80 text-yellow-200"
                            : "bg-red-900/80 text-red-200"
                        }`}
                      >
                        {getStatusText(preview.status)}
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
                  Are you sure you want to delete this preview? This action
                  cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => deletePreview(deleteConfirm)}
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
          {showModal && selectedPreview && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedPreview.appName}
                      </h2>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusIcon(selectedPreview.status)}
                        <span className="text-gray-400">
                          {getStatusText(selectedPreview.status)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {formatDate(selectedPreview.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {selectedPreview.status === "completed" && (
                        <button
                          onClick={() => viewPreview(selectedPreview._id)}
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
                    <label className="block text-lg font-semibold text-white mb-3">
                      Code
                    </label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedPreview.generatedCode || "No code available."}
                      </p>
                    </div>
                  </div>

                  {/* Requirements Details */}
                  {selectedPreview.requirement &&
                    selectedPreview.requirement.extractedRequirements && (
                      <div className="space-y-6 mt-6 pt-6 border-t border-gray-700">
                        {/* Requirement Features (if different from generated app features) */}
                        {selectedPreview.requirement.extractedRequirements
                          .features &&
                          selectedPreview.requirement.extractedRequirements
                            .features.length > 0 && (
                            <div>
                              <label className="block text-lg font-semibold text-white mb-3">
                                Required Features
                              </label>
                              <div className="space-y-3">
                                {selectedPreview.requirement.extractedRequirements.features.map(
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
                        {selectedPreview.requirement.extractedRequirements
                          .technicalRequirements &&
                          selectedPreview.requirement.extractedRequirements
                            .technicalRequirements.length > 0 && (
                            <div>
                              <label className="block text-lg font-semibold text-white mb-3">
                                Technical Requirements
                              </label>
                              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                <ul className="space-y-2">
                                  {selectedPreview.requirement.extractedRequirements.technicalRequirements.map(
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
