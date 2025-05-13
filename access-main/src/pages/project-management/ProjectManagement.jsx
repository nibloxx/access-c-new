import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PhaseWarningModal from "../../components/project-management/PhaseWarningModal";
import ProjectForm from "../../components/project-management/ProjectForm";
import ProjectListItem from "../../components/project-management/ProjectListItem";
import ResourceManagementModal from "../../components/project-management/ResourceManagementModal";
import TeamManagementModal from "../../components/project-management/TeamManagementModal";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { axiosInstance } from "../../utils/axios";
import { PHASE_PERMISSIONS, PROJECT_PHASES } from "../../utils/constants";

const ProjectManagement = () => {
  // State management
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teams: [],
    currentPhase: PROJECT_PHASES.PLANNING
  });

  const user = useSelector((state) => state.user.user);

  // Permission checks
  const hasPermission = (phase, permissionType) => {
    if (!phase) return false;
    const permissions = PHASE_PERMISSIONS[phase];
    return user.roles.some(role => permissions[permissionType]?.includes(role));
  };

  // Data fetching
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects');  // Use axiosInstance
      setProjects(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setIsLoading(false);
    }
  };

  // Action handlers
  const handleCreateProject = async () => {
    // Check permissions first
    if (!hasPermission(PROJECT_PHASES.PLANNING, 'canEdit')) {
      console.error("You don't have permission to create projects");
      return;
    }

    // Validate form data
    if (!formData.name.trim()) {
      console.error("Project name is required");
      return;
    }

    try {
      const response = await axiosInstance.post('/projects', formData);  // Use axiosInstance
      if (response.data) {
        await fetchProjects();
        resetForm();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // const handleUpdateProject = async () => {
  //   const phase = project.currentPhase;
    
  //   if (phase === PROJECT_PHASES.REVIEW && !showWarning) {
  //     setShowWarning(true);
  //     return;
  //   }

  //   if (phase === PROJECT_PHASES.CLOSED) {
  //     return;
  //   }

  //   try {
  //     await axiosInstance.put(`/projects/${project._id}`, formData);  // Use axiosInstance
  //     fetchProjects();
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error updating project:", error);
  //   }
  // };
  const handleUpdateProject = async (skipWarning = false) => {
    const phase = project.currentPhase;
    
    if (phase === PROJECT_PHASES.REVIEW && !skipWarning && !showWarning) {
      setShowWarning(true);
      return;
    }

    if (phase === PROJECT_PHASES.CLOSED) {
      return;
    }

    try {
      const response = await axiosInstance.put(`/projects/${project._id}`, formData);
      if (response.data) {
        await fetchProjects();
        resetForm();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };
  const handleDeleteProject = async (projectId) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}`);  // Use axiosInstance
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
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
  };
  const handleProceed = async () => {
    setShowWarning(false); // Close the warning modal
    await handleUpdateProject(true); // Pass true to skip warning check
  };
  if (isLoading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            <ProjectListItem
              key={project._id}
              project={project}
              hasPermission={hasPermission}
              onEdit={() => {
                setProject(project);
                setEditMode(true);
                setFormData({
                  name: project.name,
                  description: project.description,
                  teams: project.teams,
                  currentPhase: project.currentPhase
                });
              }}
              onDelete={() => handleDeleteProject(project._id)}
              onTeamManage={() => handleTeamManagement(project)}
              onResourceManage={() => handleResourceManagement(project)}
            />
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