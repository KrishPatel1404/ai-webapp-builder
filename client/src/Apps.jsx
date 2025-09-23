import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

const Apps = () => {
  const [apps, setApps] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  // Fetch user's apps and requirements on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch apps and requirements in parallel
        const [appsResponse, requirementsResponse] = await Promise.all([
          fetch("/api/apps", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/requirements", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const appsData = await appsResponse.json();
        const requirementsData = await requirementsResponse.json();

        if (appsData.success) {
          setApps(appsData.apps);
        }

        if (requirementsData.success) {
          // Filter requirements to only show those that are ready for app generation
          const availableRequirements = (
            requirementsData.data ||
            requirementsData.requirements ||
            []
          ).filter(
            (req) => req.status === "draft" || req.status === "completed"
          );
          setRequirements(availableRequirements);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const refetchData = async () => {
    try {
      setLoading(true);

      // Fetch apps and requirements in parallel
      const [appsResponse, requirementsResponse] = await Promise.all([
        fetch("/api/apps", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/requirements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const appsData = await appsResponse.json();
      const requirementsData = await requirementsResponse.json();

      if (appsData.success) {
        setApps(appsData.apps);
      }

      if (requirementsData.success) {
        // Filter requirements to only show those that are ready for app generation
        const availableRequirements = (
          requirementsData.data ||
          requirementsData.requirements ||
          []
        ).filter((req) => req.status === "draft" || req.status === "completed");
        setRequirements(availableRequirements);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateApp = async () => {
    if (!selectedRequirement) {
      setError("Please select a requirement");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const response = await fetch("/api/apps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requirementId: selectedRequirement,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh apps list to show the new app
        refetchData();
        setSelectedRequirement("");
        alert("App generated successfully!");
      } else {
        setError(data.error || "Failed to generate app");
      }
    } catch (error) {
      console.error("Error generating app:", error);
      setError("Failed to generate app");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteApp = async (appId) => {
    if (!confirm("Are you sure you want to delete this app?")) return;

    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        refetchData(); // Refresh the list
      } else {
        setError(data.error || "Failed to delete app");
      }
    } catch (error) {
      console.error("Error deleting app:", error);
      setError("Failed to delete app");
    }
  };

  const viewAppDetails = (app) => {
    // Navigate to app details page or show in modal
    console.log("App details:", app);
    alert(
      `App: ${app.name}\nStatus: ${
        app.status
      }\nTech Stack: ${app.techStack.join(", ")}`
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Generated Apps
        </h1>

        {/* App Generation Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Generate New App
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedRequirement}
              onChange={(e) => setSelectedRequirement(e.target.value)}
              disabled={isGenerating}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a requirement...</option>
              {requirements.map((req) => (
                <option key={req.id || req._id} value={req.id || req._id}>
                  {req.title}{" "}
                  {req.status === "completed" ? "(Has Apps)" : "(Ready)"}
                </option>
              ))}
            </select>

            <button
              onClick={generateApp}
              disabled={isGenerating || !selectedRequirement}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate App"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Apps List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No apps generated yet.</p>
              <p>
                Select a requirement and click "Generate App" to create your
                first app!
              </p>
            </div>
          </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {app.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      app.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : app.status === "generating"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {app.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Requirement:</span>{" "}
                    {app.requirement?.title}
                  </p>
                  <p>
                    <span className="font-medium">Tech Stack:</span>{" "}
                    {app.techStack.join(", ")}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewAppDetails(app)}
                    disabled={app.status !== "completed"}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    View Code
                  </button>
                  <button
                    onClick={() => deleteApp(app.id)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Apps;
