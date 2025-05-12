import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axios";
import {
  Users,
  Briefcase,
  UserCheck,
  FolderGit2,
  Download,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    counts: {
      users: 0,
      teams: 0,
      roles: 0,
      projects: 0,
    },
    recentLogs: [],
    userActivity: [],
    teamSizes: [],
  });

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get("/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
  const exportToCSV = (logs) => {
    // Define CSV headers with additional columns
    const headers = [
      "Username",
      "Action",
      "Resource",
      "Status",
      "IP Address",
      "Access Time",
      "Created At",
    ];

    // Convert logs to CSV format with proper date handling
    const csvData = logs.map((log) => [
      log.user?.username || "Unknown User",
      log.action,
      log.resource || "Unknown Resource",
      log.granted ? "Granted" : "Denied",
      log.contextData?.ipAddress || "Unknown IP",
      new Date(log.contextData?.time).toLocaleString() || "Unknown Time",
      new Date(log.createdAt).toLocaleString(),
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `activity-logs-${new Date().toLocaleString().replace(/[/:]/g, "-")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.counts.users} icon={Users} />
        <StatCard
          title="Total Teams"
          value={stats.counts.teams}
          icon={Briefcase}
        />
        <StatCard
          title="Total Roles"
          value={stats.counts.roles}
          icon={UserCheck}
        />
        <StatCard
          title="Total Projects"
          value={stats.counts.projects}
          icon={FolderGit2}
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <div className="flex justify-end">
          <button
            onClick={() => exportToCSV(stats.recentLogs)}
            className="flex  items-center px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors my-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>

        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {stats.recentLogs.map((log) => (
              <li key={log._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        {log.user?.username || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.action} - {log.resource || "Unknown Resource"}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.granted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.granted ? "Granted" : "Denied"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {/* {new Date(log.timestamp).toLocaleString()} */}

                    {  new Date(log.contextData?.time).toLocaleString() || "Unknown Time"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Team Sizes */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Team Distribution
        </h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              {stats.teamSizes.map((team) => (
                <div
                  key={team._id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-600">
                    {team.name}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      {team.memberCount} members
                    </span>
                    <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 rounded-full h-2"
                        style={{
                          width: `${
                            (team.memberCount /
                              Math.max(
                                ...stats.teamSizes.map((t) => t.memberCount)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          User Activity (Last 7 Days)
        </h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64 flex items-end space-x-2">
              {stats.userActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex-1 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                  style={{
                    height: `${
                      (activity.count /
                        Math.max(...stats.userActivity.map((a) => a.count))) *
                      100
                    }%`,
                  }}
                >
                  <div className="transform -rotate-45 translate-y-6 text-xs text-gray-500">
                    {new Date(activity._id).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
