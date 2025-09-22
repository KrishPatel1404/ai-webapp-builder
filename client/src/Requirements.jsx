import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function Requirements() {
  const navigate = useNavigate();
  // const { user, isAuthenticated, loading } = useAuth();
  const { isAuthenticated, loading } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch requirements when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchRequirements();
    }
  }, [isAuthenticated]);

  const fetchRequirements = async () => {
    try {
      setLoadingRequirements(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requirements`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequirements(data.data || []);
        setError(""); // Clear any previous errors
      } else {
        setError("Failed to fetch requirements");
      }
    } catch (error) {
      console.error("Error fetching requirements:", error);
      setError("Failed to load requirements");
    } finally {
      setLoadingRequirements(false);
    }
  };

  const deleteRequirement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requirements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedRequirements = requirements.filter(
          (req) => req._id !== id
        );
        setRequirements(updatedRequirements);
        setDeleteConfirm(null);
      } else {
        setError("Failed to delete requirement");
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
      setError("Failed to delete requirement");
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

  const openModal = (requirement) => {
    setSelectedRequirement(requirement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequirement(null);
  };

  if (loading || loadingRequirements) {
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
                Requirements Generated
              </h1>
              <p className="text-gray-400">
                View and manage your extracted requirements
              </p>
            </div>
          </div>

          <hr className="border-gray-600 my-4" />

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {requirements.length === 0 ? (
            <div className="text-center py-12">
              <FiLayers className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {requirements.length === 0
                  ? "No requirements found"
                  : "No matching requirements"}
              </h3>
              <p className="text-gray-500 mb-6">
                {requirements.length === 0
                  ? "You haven't extracted any requirements yet. Start by creating your first requirement extraction."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {requirements.length === 0 && (
                <button
                  onClick={() => navigate("/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Create Requirements
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requirements.map((requirement) => (
                <div
                  key={requirement._id}
                  onClick={() => openModal(requirement)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {requirement.extractedRequirements?.appName ||
                          requirement.title ||
                          "Untitled"}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(requirement._id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Delete Requirement"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-2">
                    {requirement.extractedRequirements?.entities?.length >
                      0 && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase">
                          Entities:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {requirement.extractedRequirements.entities
                            .slice(0, 3)
                            .map((entity, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                              >
                                {entity}
                              </span>
                            ))}
                          {requirement.extractedRequirements.entities.length >
                            3 && (
                            <span className="text-xs text-gray-500">
                              +
                              {requirement.extractedRequirements.entities
                                .length - 3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {requirement.extractedRequirements?.features?.length >
                      0 && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase">
                          Features:
                        </span>
                        <p className="text-sm text-gray-400">
                          {requirement.extractedRequirements.features.length}{" "}
                          feature
                          {requirement.extractedRequirements.features.length !==
                          1
                            ? "s"
                            : ""}{" "}
                          extracted
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <FiCalendar className="mr-1" />
                    {formatDate(requirement.createdAt)}
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
                  Are you sure you want to delete this requirement?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => deleteRequirement(deleteConfirm)}
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
          {showModal && selectedRequirement && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedRequirement.extractedRequirements?.appName ||
                          selectedRequirement.title ||
                          "Untitled"}
                      </h2>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedRequirement.status)}
                        <span className="text-gray-400">
                          {getStatusText(selectedRequirement.status)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {formatDate(selectedRequirement.createdAt)}
                        </span>
                      </div>
                    </div>
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

                  {selectedRequirement.extractedRequirements && (
                    <div className="space-y-6">
                      {/* Original Prompt */}
                      {selectedRequirement.prompt && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Original Prompt
                          </h3>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 whitespace-pre-wrap">
                              {selectedRequirement.prompt}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Entities */}
                      {selectedRequirement.extractedRequirements.entities
                        ?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Entities
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedRequirement.extractedRequirements.entities.map(
                              (entity, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg"
                                >
                                  {entity}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Roles */}
                      {selectedRequirement.extractedRequirements.roles?.length >
                        0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            User Roles
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedRequirement.extractedRequirements.roles.map(
                              (role, index) => (
                                <span
                                  key={index}
                                  className="bg-green-900/50 border border-green-700 text-green-200 px-3 py-1 rounded-lg"
                                >
                                  {role}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {selectedRequirement.extractedRequirements.features
                        ?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Features
                          </h3>
                          <div className="space-y-3">
                            {selectedRequirement.extractedRequirements.features.map(
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
                                        <span className="bg-purple-900/50 border border-purple-700 text-purple-200 text-xs px-2 py-1 rounded">
                                          {feature.category}
                                        </span>
                                      )}
                                      {feature.userRole && (
                                        <span className="bg-orange-900/50 border border-orange-700 text-orange-200 text-xs px-2 py-1 rounded">
                                          {feature.userRole}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-300 mb-2">
                                    {feature.description}
                                  </p>
                                  {feature.hint && (
                                    <p className="text-gray-400 text-sm italic">
                                      💡 {feature.hint}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Technical Requirements */}
                      {selectedRequirement.extractedRequirements
                        .technicalRequirements?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Technical Requirements
                          </h3>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <ul className="space-y-2">
                              {selectedRequirement.extractedRequirements.technicalRequirements.map(
                                (req, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-300 flex items-start"
                                  >
                                    <span className="text-blue-400 mr-2">
                                      •
                                    </span>
                                    {req}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Business Rules */}
                      {selectedRequirement.extractedRequirements.businessRules
                        ?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Business Rules
                          </h3>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <ul className="space-y-2">
                              {selectedRequirement.extractedRequirements.businessRules.map(
                                (rule, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-300 flex items-start"
                                  >
                                    <span className="text-green-400 mr-2">
                                      •
                                    </span>
                                    {rule}
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

export default Requirements;
