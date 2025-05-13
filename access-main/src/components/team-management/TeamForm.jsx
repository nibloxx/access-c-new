import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const TeamForm = ({ isOpen, onClose, team, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (team) {
        setFormData({
          name: team.name,
          description: team.description,
          members: team.members
        });
      } else {
        setFormData({
          name: '',
          description: '',
          members: []
        });
      }
    }
  }, [isOpen, team]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting team:', error);
      setError('Failed to save team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberRoleChange = (userId, newRole) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.user === userId ? { ...member, role: newRole } : member
      )
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={team ? 'Edit Team' : 'Create Team'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Team Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {availableUsers.map(user => (
              <div key={user._id} className="p-3 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`user-${user._id}`}
                      checked={formData.members.some(m => m.user === user._id)}
                      onChange={(e) => {
                        const members = e.target.checked
                          ? [...formData.members, { user: user._id, role: 'member' }]
                          : formData.members.filter(m => m.user !== user._id);
                        setFormData({ ...formData, members });
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor={`user-${user._id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {user.firstName} {user.lastName} ({user.email})
                    </label>
                  </div>
                  {formData.members.some(m => m.user === user._id) && (
                    <select
                      value={formData.members.find(m => m.user === user._id)?.role || 'member'}
                      onChange={(e) => handleMemberRoleChange(user._id, e.target.value)}
                      className="ml-2 text-sm border-gray-300 rounded-md"
                    >
                      <option value="member">Member</option>
                      <option value="leader">Leader</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamForm; 