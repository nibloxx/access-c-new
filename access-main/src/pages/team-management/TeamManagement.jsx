import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { axiosInstance } from '../../utils/axios';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import TeamForm from '../../components/team-management/TeamForm';

const TeamManagement = () => {
  // State management
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const user = useSelector((state) => state.user.user);

  // Check if user has admin or manager role
  const hasPermission = user?.roles?.some(role => ['Admin', 'Manager'].includes(role));

  // Fetch teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/teams');
      setTeams(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle team creation
  const handleCreateTeam = async (formData) => {
    try {
      const response = await axiosInstance.post('/teams', formData);
      if (response.data) {
        await fetchTeams();
        setShowForm(false);
        setError(null);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
      throw error;
    }
  };

  // Handle team update
  const handleUpdateTeam = async (formData) => {
    try {
      const response = await axiosInstance.put(`/teams/${selectedTeam._id}`, formData);
      if (response.data) {
        await fetchTeams();
        setShowForm(false);
        setSelectedTeam(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team');
      throw error;
    }
  };

  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/teams/${teamId}`);
      await fetchTeams();
      setError(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    }
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (selectedTeam) {
      await handleUpdateTeam(formData);
    } else {
      await handleCreateTeam(formData);
    }
  };

  // Reset form state
  const resetForm = () => {
    setSelectedTeam(null);
    setShowForm(false);
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
            Team Management
          </h2>
          {hasPermission && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Team
            </Button>
          )}
        </div>

        {/* Team List */}
        <div className="p-6">
          {teams.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No teams found</p>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <div key={team._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{team.name}</h3>
                    {hasPermission && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowForm(true);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{team.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Members:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {team.members?.map((member) => (
                        <div
                          key={member.user._id}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {member.user.firstName} {member.user.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({member.role})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {team.projects?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">Projects:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {team.projects.map((project) => (
                          <span
                            key={project._id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {project.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Form Modal */}
      <TeamForm
        isOpen={showForm}
        onClose={resetForm}
        team={selectedTeam}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TeamManagement;
