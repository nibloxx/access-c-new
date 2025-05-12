import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import { baseDomain } from "../../utils/axios";

const ProjectManagement = () => {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teams: [],
  });

  const ALLOWED_ROLES = ["SuperAdmin", "Admin", "Manager"];
  const userRoles = useSelector((state) => state.user.user.roles);
  const API_URL = baseDomain;

  const hasPermission = userRoles.some((role) => ALLOWED_ROLES.includes(role));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await axios.post(`${API_URL}/projects`, formData);
      fetchProjects();
      setFormData({ name: "", description: "", teams: [] });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleUpdateProject = async () => {
    if (project.currentPhase === "review" && !showWarning) {
      setShowWarning(true);
      return;
    }

    try {
      await axios.put(`${API_URL}/projects/${project._id}`, formData);
      fetchProjects();
      setEditMode(false);
      setShowWarning(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const getPhaseVariant = (phase) => {
    switch (phase) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "execution":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "default";
    }
  };

  const canEdit = (project) => {
    if (!project) return false;

    switch (project.currentPhase) {
      case "planning":
        return ["admin", "teamLead"].includes(userRole);
      case "execution":
        return ["admin", "teamLead"].includes(userRole);
      case "review":
        return userRole === "admin";
      case "closed":
        return false;
      default:
        return false;
    }
  };

  const canViewDocuments = (project) => {
    return project.phasePermissions[
      project.currentPhase
    ].canViewDocuments.includes(userRole);
  };

  const canEditModels = (project) => {
    return project.phasePermissions[
      project.currentPhase
    ].canEditModels.includes(userRole);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Project Management
          </h2>
          {hasPermission && (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Project
            </Button>
          )}
        </div>

        {/* Project List */}
        <div className="p-6 space-y-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium">{project.name}</h3>
                  <Badge variant={getPhaseVariant(project.currentPhase)}>
                    {project.currentPhase}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  {canViewDocuments(project) && (
                    <Button
                      onClick={() => handleViewDocuments(project._id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Documents
                    </Button>
                  )}
                  {canEditModels(project) && (
                    <Button
                      onClick={() => handleEditModels(project._id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Edit Models
                    </Button>
                  )}
                  {canEdit(project) && (
                    <Button
                      onClick={() => handleEdit(project)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editMode}
        onClose={() => setEditMode(false)}
        title={project ? "Edit Project" : "Create Project"}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Project Name"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Project Description"
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={project ? handleUpdateProject : handleCreateProject}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {project ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title="Warning"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <svg
              className="w-5 h-5 mr-2 text-yellow-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-yellow-700">
              Project is in {project?.currentPhase} phase. Are you sure you want
              to make changes?
            </span>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowWarning(false)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Proceed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
