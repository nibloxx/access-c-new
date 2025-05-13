import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { axiosInstance } from '../../utils/axios';
import toast from 'react-hot-toast';

const TeamManagementModal = ({ isOpen, onClose, project, onSave }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      setSelectedTeams(project?.teams || []);
    }
  }, [isOpen, project]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError(error.response?.data?.message || 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      await onSave({ ...project, teams: selectedTeams });
      toast.success('Teams updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving teams:', error);
      setError(error.response?.data?.message || 'Failed to save teams');
      toast.error(error.response?.data?.message || 'Failed to save teams');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Teams"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {teams.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No teams available</p>
            ) : (
              teams.map(team => (
                <div key={team._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    id={team._id}
                    checked={selectedTeams.includes(team._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeams([...selectedTeams, team._id]);
                      } else {
                        setSelectedTeams(selectedTeams.filter(id => id !== team._id));
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={team._id} className="text-sm text-gray-700">{team.name}</label>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TeamManagementModal;