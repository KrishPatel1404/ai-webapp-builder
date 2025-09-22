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
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    appName: "",
    prompt: "",
    entities: [],
    roles: [],
    features: [],
    technicalRequirements: [],
    businessRules: [],
  });

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

  const openModal = (requirement) => {
    setSelectedRequirement(requirement);
    setEditForm({
      appName:
        requirement.extractedRequirements?.appName || requirement.title || "",
      prompt: requirement.prompt || "",
      entities: requirement.extractedRequirements?.entities || [],
      roles: requirement.extractedRequirements?.roles || [],
      features: requirement.extractedRequirements?.features || [],
      technicalRequirements:
        requirement.extractedRequirements?.technicalRequirements || [],
      businessRules: requirement.extractedRequirements?.businessRules || [],
    });
    setIsEditing(false);
    setError(""); // Clear any error messages
    setSuccessMessage(""); // Clear any success messages
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequirement(null);
    setIsEditing(false);
  };

  const validateForm = () => {
    if (!editForm.appName || editForm.appName.trim().length < 1) {
      setError("App name is required");
      return false;
    }
    if (!editForm.prompt || editForm.prompt.trim().length < 10) {
      setError("Prompt must be at least 10 characters long");
      return false;
    }
    if (editForm.prompt.length > 1500) {
      setError("Prompt cannot be more than 1500 characters");
      return false;
    }
    if (editForm.appName.length > 150) {
      setError("App name cannot be more than 150 characters");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requirements/${
          selectedRequirement._id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.appName,
            prompt: editForm.prompt,
            extractedRequirements: {
              appName: editForm.appName,
              entities: editForm.entities,
              roles: editForm.roles,
              features: editForm.features,
              technicalRequirements: editForm.technicalRequirements,
              businessRules: editForm.businessRules,
            },
          }),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setRequirements(
          requirements.map((req) =>
            req._id === selectedRequirement._id ? updatedData.data : req
          )
        );
        setSelectedRequirement(updatedData.data);
        setIsEditing(false);
        setError(""); // Clear any previous errors
        setSuccessMessage("Requirement updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update requirement");
      }
    } catch (error) {
      console.error("Error updating requirement:", error);
      setError("Failed to update requirement");
    }
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setEditForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const handleFeatureAdd = () => {
    setEditForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          title: "",
          description: "",
          category: "",
          userRole: "",
          hint: "",
        },
      ],
    }));
  };

  const handleFeatureRemove = (index) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
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
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="mr-4">
                          <input
                            type="text"
                            value={editForm.appName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                appName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                          />
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {selectedRequirement.extractedRequirements?.appName ||
                            selectedRequirement.title ||
                            "Untitled"}
                        </h2>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
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
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Edit
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

                  {selectedRequirement.extractedRequirements && (
                    <div className="space-y-6">
                      {/* Original Prompt */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Original Prompt
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editForm.prompt}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                prompt: e.target.value,
                              }))
                            }
                            rows={6}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Enter the original prompt..."
                          />
                        ) : (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 whitespace-pre-wrap">
                              {selectedRequirement.prompt}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Entities */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Entities
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editForm.entities.map((entity, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg flex items-center"
                                >
                                  <span>{entity}</span>
                                  <button
                                    onClick={() =>
                                      handleArrayRemove("entities", index)
                                    }
                                    className="ml-2 text-blue-300 hover:text-red-300 transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add new entity..."
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleArrayAdd("entities", e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  handleArrayAdd("entities", input.value);
                                  input.value = "";
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(
                              selectedRequirement.extractedRequirements
                                .entities || []
                            ).map((entity, index) => (
                              <span
                                key={index}
                                className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Roles */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          User Roles
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editForm.roles.map((role, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg flex items-center"
                                >
                                  <span>{role}</span>
                                  <button
                                    onClick={() =>
                                      handleArrayRemove("roles", index)
                                    }
                                    className="ml-2 text-blue-300 hover:text-red-300 transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add new role..."
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleArrayAdd("roles", e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  handleArrayAdd("roles", input.value);
                                  input.value = "";
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(
                              selectedRequirement.extractedRequirements.roles ||
                              []
                            ).map((role, index) => (
                              <span
                                key={index}
                                className="bg-blue-900/50 border border-blue-700 text-blue-200 px-3 py-1 rounded-lg"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Features
                        </label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {editForm.features.map((feature, index) => (
                              <div
                                key={index}
                                className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          value={feature.title}
                                          onChange={(e) =>
                                            handleFeatureChange(
                                              index,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="Feature title..."
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Category
                                          </label>
                                          <input
                                            type="text"
                                            value={feature.category}
                                            onChange={(e) =>
                                              handleFeatureChange(
                                                index,
                                                "category",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., CRUD, Authentication..."
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-300 mb-1">
                                            User Role
                                          </label>
                                          <input
                                            type="text"
                                            value={feature.userRole}
                                            onChange={(e) =>
                                              handleFeatureChange(
                                                index,
                                                "userRole",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Admin, User..."
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                          Description
                                        </label>
                                        <textarea
                                          value={feature.description}
                                          onChange={(e) =>
                                            handleFeatureChange(
                                              index,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          rows={3}
                                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                          placeholder="Detailed description of the feature..."
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                          Implementation Hint
                                        </label>
                                        <input
                                          type="text"
                                          value={feature.hint}
                                          onChange={(e) =>
                                            handleFeatureChange(
                                              index,
                                              "hint",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="Implementation tips or notes..."
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleFeatureRemove(index)}
                                      className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                                      title="Remove feature"
                                    >
                                      <FiTrash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={handleFeatureAdd}
                              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                              + Add New Feature
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(
                              selectedRequirement.extractedRequirements
                                .features || []
                            ).map((feature, index) => (
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
                                {feature.hint && (
                                  <p className="text-gray-400 text-sm italic">
                                    💡 {feature.hint}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Technical Requirements */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Technical Requirements
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="space-y-2 mb-3">
                              {editForm.technicalRequirements.map(
                                (req, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-700 border border-gray-600 rounded-lg p-3 flex items-start"
                                  >
                                    <span className="text-blue-400 mr-2 mt-1">
                                      •
                                    </span>
                                    <input
                                      type="text"
                                      value={req}
                                      onChange={(e) => {
                                        const newReqs = [
                                          ...editForm.technicalRequirements,
                                        ];
                                        newReqs[index] = e.target.value;
                                        setEditForm((prev) => ({
                                          ...prev,
                                          technicalRequirements: newReqs,
                                        }));
                                      }}
                                      className="flex-1 bg-transparent text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                      placeholder="Technical requirement..."
                                    />
                                    <button
                                      onClick={() =>
                                        handleArrayRemove(
                                          "technicalRequirements",
                                          index
                                        )
                                      }
                                      className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add new technical requirement..."
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleArrayAdd(
                                      "technicalRequirements",
                                      e.target.value
                                    );
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  handleArrayAdd(
                                    "technicalRequirements",
                                    input.value
                                  );
                                  input.value = "";
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <ul className="space-y-2">
                              {(
                                selectedRequirement.extractedRequirements
                                  .technicalRequirements || []
                              ).map((req, index) => (
                                <li
                                  key={index}
                                  className="text-gray-300 flex items-start"
                                >
                                  <span className="text-blue-400 mr-2">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Business Rules */}
                      <div>
                        <label className="block text-lg font-semibold text-white mb-3">
                          Business Rules
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="space-y-2 mb-3">
                              {editForm.businessRules.map((rule, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 flex items-start"
                                >
                                  <span className="text-blue-400 mr-2 mt-1">
                                    •
                                  </span>
                                  <input
                                    type="text"
                                    value={rule}
                                    onChange={(e) => {
                                      const newRules = [
                                        ...editForm.businessRules,
                                      ];
                                      newRules[index] = e.target.value;
                                      setEditForm((prev) => ({
                                        ...prev,
                                        businessRules: newRules,
                                      }));
                                    }}
                                    className="flex-1 bg-transparent text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                  />
                                  <button
                                    onClick={() =>
                                      handleArrayRemove("businessRules", index)
                                    }
                                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add new business rule..."
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleArrayAdd(
                                      "businessRules",
                                      e.target.value
                                    );
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  handleArrayAdd("businessRules", input.value);
                                  input.value = "";
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <ul className="space-y-2">
                              {(
                                selectedRequirement.extractedRequirements
                                  .businessRules || []
                              ).map((rule, index) => (
                                <li
                                  key={index}
                                  className="text-gray-300 flex items-start"
                                >
                                  <span className="text-blue-400 mr-2">•</span>
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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
