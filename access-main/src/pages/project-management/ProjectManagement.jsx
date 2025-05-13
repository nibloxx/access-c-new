import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PhaseWarningModal from "../../components/project-management/PhaseWarningModal";
import ProjectForm from "../../components/project-management/ProjectForm";
import ResourceManagementModal from "../../components/project-management/ResourceManagementModal";
import TeamManagementModal from "../../components/project-management/TeamManagementModal";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { axiosInstance } from "../../utils/axios";

// Project phases and permissions
const PROJECT_PHASES = {
  PLANNING: 'planning',
  EXECUTION: 'execution',
  REVIEW: 'review',
  CLOSED: 'closed'
};

const PHASE_PERMISSIONS = {
  [PROJECT_PHASES.PLANNING]: {
    canEdit: ['Admin', 'Manager'],
    canCreate: ['Admin', 'Manager'],
    canEditTeams: ['Admin', 'Manager']
  },
  [PROJECT_PHASES.EXECUTION]: {
    canEdit: ['Admin'],
    canManageResources: ['Admin', 'Manager']
  },
  [PROJECT_PHASES.REVIEW]: {
    canEdit: ['Admin'],
    requiresWarning: true
  },
  [PROJECT_PHASES.CLOSED]: {
    canView: ['Admin', 'Manager', 'Developer']
  }
};

const ProjectManagement = () => {
  // State management
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teams: [],
    currentPhase: PROJECT_PHASES.PLANNING
  });

  const user = useSelector((state) => state.user.user);

  // Permission checks
  const hasPermission = (phase, permissionType) => {
    if (!phase || !user || !user.roles) return false;
    const permissions = PHASE_PERMISSIONS[phase];
    return user.roles.some(role => permissions[permissionType]?.includes(role));
  };

  // Data fetching
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/projects');
      setProjects(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Action handlers
  const handleCreateProject = async () => {
    try {
      if (!hasPermission(PROJECT_PHASES.PLANNING, 'canEdit')) {
        setError("You don't have permission to create projects");
        return;
      }

      if (!formData.name.trim()) {
        setError("Project name is required");
        return;
      }

      const response = await axiosInstance.post('/projects', formData);
      if (response.data) {
        await fetchProjects();
        resetForm();
        setError(null);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleUpdateProject = async (skipWarning = false) => {
    const phase = project.currentPhase;
    const newPhase = formData.currentPhase;
    
    // Check if transitioning to closed phase
    if (newPhase === PROJECT_PHASES.CLOSED) {
      skipWarning = true;
    }
    
    if (phase === PROJECT_PHASES.REVIEW && !skipWarning && !showWarning) {
      setShowWarning(true);
      return;
    }

    try {
      const response = await axiosInstance.put(`/projects/${project._id}`, formData);
      if (response.data) {
        await fetchProjects();
        resetForm();
        setError(null);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setError(error.response?.data?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      await fetchProjects();
      setError(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(error.response?.data?.message || "Failed to delete project");
    }
  };

  const handleTeamManagement = (project) => {
    setProject(project);
    setShowTeamModal(true);
  };

  const handleResourceManagement = (project) => {
    setProject(project);
    setShowResourceModal(true);
  };

  const handleProceed = async () => {
    setShowWarning(false);
    await handleUpdateProject(true);
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      teams: [],
      currentPhase: PROJECT_PHASES.PLANNING
    });
    setEditMode(false);
    setShowWarning(false);
    setShowTeamModal(false);
    setShowResourceModal(false);
    setProject(null);
    setError(null);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Project Management
          </h2>
          {hasPermission(PROJECT_PHASES.PLANNING, 'canEdit') && (
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
            <div key={project._id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  project.currentPhase === PROJECT_PHASES.PLANNING ? 'bg-blue-100 text-blue-800' :
                  project.currentPhase === PROJECT_PHASES.EXECUTION ? 'bg-green-100 text-green-800' :
                  project.currentPhase === PROJECT_PHASES.REVIEW ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.currentPhase}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex space-x-2">
                {project.currentPhase === PROJECT_PHASES.PLANNING && 
                 hasPermission(project.currentPhase, 'canEditTeams') && (
                  <Button
                    onClick={() => handleTeamManagement(project)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Manage Teams
                  </Button>
                )}

                {project.currentPhase === PROJECT_PHASES.EXECUTION && 
                 hasPermission(project.currentPhase, 'canManageResources') && (
                  <Button
                    onClick={() => handleResourceManagement(project)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Manage Resources
                  </Button>
                )}

                {hasPermission(project.currentPhase, 'canEdit') && (
                  <>
                    <Button
                      onClick={() => {
                        setProject(project);
                        setEditMode(true);
                        setFormData({
                          name: project.name,
                          description: project.description,
                          teams: project.teams,
                          currentPhase: project.currentPhase
                        });
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      disabled={project.currentPhase === PROJECT_PHASES.CLOSED}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project._id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={project.currentPhase === PROJECT_PHASES.CLOSED}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={editMode}
        onClose={resetForm}
        formData={formData}
        setFormData={setFormData}
        onSubmit={project ? handleUpdateProject : handleCreateProject}
        isEdit={!!project}
      />

      <PhaseWarningModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={handleProceed}
        phase={project?.currentPhase}
      />

      <TeamManagementModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        project={project}
        onSave={handleUpdateProject}
      />

      <ResourceManagementModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        project={project}
        onSave={handleUpdateProject}
      />
    </div>
  );
};

export default ProjectManagement;