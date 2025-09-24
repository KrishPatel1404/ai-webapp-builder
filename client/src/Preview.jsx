import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiExternalLink,
  FiCode,
  FiDatabase,
  FiServer,
  FiMonitor,
} from "react-icons/fi";

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [app, setApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchApp = useCallback(async () => {
    try {
      setLoadingApp(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apps/${id}`,
        {
          method: "GET",
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
        if (response.status === 404) {
          throw new Error("App not found");
        }
        throw new Error("Failed to fetch app details");
      }

      const data = await response.json();
      setApp(data.app);
      setLoadingApp(false);
    } catch (error) {
      console.error("Error fetching app:", error);
      setError(error.message || "Failed to load app details");
      setLoadingApp(false);
    }
  }, [navigate, id]);

  // Fetch app details
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchApp();
    }
  }, [isAuthenticated, id, fetchApp]);

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || loadingApp) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/previews"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
            >
              <FiArrowLeft className="mr-2" />
              Back to Apps
            </Link>
            <div className="text-center py-12">
              <FiXCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                {error}
              </h2>
              <p className="text-gray-400 mb-6">
                The app you're looking for might have been deleted or you don't
                have access to it.
              </p>
              <Link
                to="/previews"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                View All Apps
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/previews"
              className="inline-flex items-center text-blue-400 hover:text-blue-300"
            >
              <FiArrowLeft className="mr-2" />
              Back to Apps
            </Link>
          </div>

          {/* App Details */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {app.name}
                  </h1>
                  {app.description && (
                    <p className="text-gray-300 mb-4">{app.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(app.status)}
                      <span className="text-gray-300">
                        {getStatusText(app.status)}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">
                      Created {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {app.status === "failed" && app.errorMessage && (
                <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  <h3 className="font-semibold mb-2">Generation Failed</h3>
                  <p>{app.errorMessage}</p>
                </div>
              )}

              {app.status === "generating" && (
                <div className="mb-6 bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <FiClock className="animate-spin mr-2" />
                    <span>
                      Your app is being generated. Please check back in a few
                      moments.
                    </span>
                  </div>
                </div>
              )}

              {app.status === "completed" && app.generatedCode && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Generated Application
                  </h2>

                  {/* Architecture Overview */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {app.generatedCode.frontend && (
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <FiMonitor className="h-8 w-8 text-blue-400 mb-2" />
                        <h3 className="font-semibold text-white">Frontend</h3>
                        <p className="text-gray-300 text-sm">
                          {app.generatedCode.frontend.framework || "React"}
                        </p>
                      </div>
                    )}
                    {app.generatedCode.backend && (
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <FiServer className="h-8 w-8 text-green-400 mb-2" />
                        <h3 className="font-semibold text-white">Backend</h3>
                        <p className="text-gray-300 text-sm">
                          {app.generatedCode.backend.framework || "Node.js"}
                        </p>
                      </div>
                    )}
                    {app.generatedCode.database && (
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <FiDatabase className="h-8 w-8 text-purple-400 mb-2" />
                        <h3 className="font-semibold text-white">Database</h3>
                        <p className="text-gray-300 text-sm">
                          {app.generatedCode.database.type || "MongoDB"}
                        </p>
                      </div>
                    )}
                    {app.generatedCode.deployment && (
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <FiExternalLink className="h-8 w-8 text-orange-400 mb-2" />
                        <h3 className="font-semibold text-white">Deployment</h3>
                        <p className="text-gray-300 text-sm">
                          {app.generatedCode.deployment.platform || "Vercel"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Code Structure */}
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiCode className="mr-2" />
                      Application Structure
                    </h3>
                    <div className="text-gray-300">
                      <p className="mb-4">
                        This application has been generated with a complete
                        structure including:
                      </p>
                      <ul className="space-y-2">
                        {app.generatedCode.frontend?.files && (
                          <li className="flex items-center">
                            <span className="text-blue-400 mr-2">•</span>
                            {app.generatedCode.frontend.files.length} frontend
                            files
                          </li>
                        )}
                        {app.generatedCode.backend?.files && (
                          <li className="flex items-center">
                            <span className="text-green-400 mr-2">•</span>
                            {app.generatedCode.backend.files.length} backend
                            files
                          </li>
                        )}
                        {app.generatedCode.database?.schema && (
                          <li className="flex items-center">
                            <span className="text-purple-400 mr-2">•</span>
                            Database schema and models
                          </li>
                        )}
                        {app.generatedCode.deployment?.instructions && (
                          <li className="flex items-center">
                            <span className="text-orange-400 mr-2">•</span>
                            Deployment configuration and instructions
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Requirement Details */}
                  {app.requirement && (
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Source Requirement
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          <span className="text-white font-medium">Title:</span>{" "}
                          {app.requirement.title}
                        </p>
                        {app.requirement.extractedRequirements?.appName && (
                          <p className="text-gray-300">
                            <span className="text-white font-medium">
                              App Name:
                            </span>{" "}
                            {app.requirement.extractedRequirements.appName}
                          </p>
                        )}
                        {app.requirement.extractedRequirements?.features && (
                          <div className="text-gray-300">
                            <span className="text-white font-medium">
                              Features:
                            </span>
                            <ul className="mt-2 space-y-1">
                              {app.requirement.extractedRequirements.features
                                .slice(0, 5)
                                .map((feature, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-400 mr-2">
                                      •
                                    </span>
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {app.metadata && (
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Generation Details
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        {app.metadata.processingTime && (
                          <div>
                            <span className="text-gray-400">
                              Processing Time:
                            </span>
                            <p className="text-white font-medium">
                              {(app.metadata.processingTime / 1000).toFixed(1)}s
                            </p>
                          </div>
                        )}
                        {app.metadata.tokensUsed && (
                          <div>
                            <span className="text-gray-400">Tokens Used:</span>
                            <p className="text-white font-medium">
                              {app.metadata.tokensUsed.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {app.metadata.apiVersion && (
                          <div>
                            <span className="text-gray-400">AI Model:</span>
                            <p className="text-white font-medium">
                              {app.metadata.apiVersion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
