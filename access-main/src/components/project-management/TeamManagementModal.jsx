import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { baseDomain } from '../../utils/axios';

const TeamManagementModal = ({ isOpen, onClose, project, onSave }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      setSelectedTeams(project?.teams || []);
    }
  }, [isOpen, project]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${baseDomain}/teams`);
      setTeams(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSave = async () => {
    try {
      await onSave({ ...project, teams: selectedTeams });
      onClose();
    } catch (error) {
      console.error('Error saving teams:', error);
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
        {isLoading ? (
          <div>Loading teams...</div>
        ) : (
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team._id} className="flex items-center space-x-2">
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
                  className="form-checkbox"
                />
                <label htmlFor={team._id}>{team.name}</label>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TeamManagementModal;