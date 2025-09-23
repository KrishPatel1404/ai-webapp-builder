import React, { useState, useEffect } from "react";
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

  // Set dummy data immediately
  useEffect(() => {
    if (isAuthenticated) {
      // Dummy data for previews
      const dummyPreviews = [
        {
          _id: "prev1",
          appName: "Task Manager Pro",
          description:
            "A professional task management application with collaboration features",
          technologies: ["React", "Node.js", "MongoDB"],
          features: [
            "Task creation and management",
            "Team collaboration",
            "Calendar integration",
            "Notifications",
            "Analytics dashboard",
          ],
          demoUrl: "https://example.com/demo/taskmanager",
          createdAt: "2025-09-20T14:30:00Z",
          status: "completed",
          requirementId: "req1",
        },
        {
          _id: "prev2",
          appName: "HealthTracker",
          description:
            "Health and fitness tracking application with personalized goals",
          technologies: ["React Native", "Express", "Firebase"],
          features: [
            "Activity tracking",
            "Nutrition planning",
            "Goal setting",
            "Progress visualization",
          ],
          demoUrl: "https://example.com/demo/healthtracker",
          createdAt: "2025-09-22T10:15:00Z",
          status: "processing",
          requirementId: "req2",
        },
        {
          _id: "prev3",
          appName: "E-commerce Platform",
          description:
            "Complete online store solution with inventory management",
          technologies: ["Next.js", "GraphQL", "PostgreSQL"],
          features: [
            "Product catalog",
            "Shopping cart",
            "Payment integration",
            "Order tracking",
            "Admin dashboard",
          ],
          demoUrl: "https://example.com/demo/ecommerce",
          createdAt: "2025-09-18T09:45:00Z",
          status: "completed",
          requirementId: "req3",
        },
        {
          _id: "prev4",
          appName: "Learning Management System",
          description:
            "Educational platform for online courses and student management",
          technologies: ["Vue.js", "Django", "MySQL"],
          features: [
            "Course creation",
            "Assignment management",
            "Quiz system",
            "Discussion forums",
            "Progress tracking",
          ],
          demoUrl: "https://example.com/demo/lms",
          createdAt: "2025-09-15T16:20:00Z",
          status: "failed",
          requirementId: "req4",
        },
      ];

      // Set previews immediately without timer
      setPreviews(dummyPreviews);
      setLoadingPreviews(false);
    }
  }, [isAuthenticated]);

  const deletePreview = async (id) => {
    try {
      // In a real app, this would make an API call
      const updatedPreviews = previews.filter((prev) => prev._id !== id);
      setPreviews(updatedPreviews);
      setDeleteConfirm(null);
      setSuccessMessage("Preview deleted successfully!");
      // Removed timeout for clearing message
    } catch (error) {
      console.error("Error deleting preview:", error);
      setError("Failed to delete preview");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-500" />;
      case "processing":
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
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return "Draft";
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

  const openModal = (preview) => {
    setSelectedPreview(preview);
    setError(""); // Clear any error messages
    setSuccessMessage(""); // Clear any success messages
    setShowModal(true);
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
            </div>
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

          {previews.length === 0 ? (
            <div className="text-center py-12">
              <FiMonitor className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No app previews found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't generated any application previews yet. Generate
                them from your requirements.
              </p>
              <button
                onClick={() => navigate("/requirements")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                View Requirements
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {previews.map((preview) => (
                <div
                  key={preview._id}
                  onClick={() => openModal(preview)}
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors duration-200 cursor-pointer"
                >
                  <div className="h-40 bg-gray-700 relative flex items-center justify-center">
                    <div className="text-3xl font-bold text-gray-500">
                      {preview.appName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          preview.status === "completed"
                            ? "bg-green-900/80 text-green-200"
                            : preview.status === "processing"
                            ? "bg-yellow-900/80 text-yellow-200"
                            : "bg-red-900/80 text-red-200"
                        }`}
                      >
                        {getStatusText(preview.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {preview.appName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {preview.description}
                        </p>
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

                    <div className="space-y-2 mb-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase">
                          Technologies:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {preview.technologies
                            .slice(0, 3)
                            .map((tech, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          {preview.technologies.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{preview.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {preview.features?.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase">
                            Features:
                          </span>
                          <p className="text-sm text-gray-400">
                            {preview.features.length} feature
                            {preview.features.length !== 1 ? "s" : ""} included
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mt-3">
                      <FiCalendar className="mr-1" />
                      {formatDate(preview.createdAt)}
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

                  {/* Preview Header */}
                  <div className="mb-6">
                    <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                      <div className="text-6xl font-bold text-gray-500">
                        {selectedPreview.appName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-white mb-3">
                      Description
                    </label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedPreview.description}
                      </p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-white mb-3">
                      Technologies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPreview.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-1">
                    <label className="block text-lg font-semibold text-white mb-3">
                      Features
                    </label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedPreview.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-gray-300 flex items-start"
                          >
                            <span className="text-blue-400 mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
