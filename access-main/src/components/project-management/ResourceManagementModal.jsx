import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { baseDomain } from '../../utils/axios';

const ResourceManagementModal = ({ isOpen, onClose, project, onSave }) => {
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && project) {
      fetchResources();
      initializeAllocations();
    }
  }, [isOpen, project]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${baseDomain}/resources`);
      setResources(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const initializeAllocations = () => {
    const currentAllocations = {};
    project.resources?.forEach(resource => {
      currentAllocations[resource.id] = resource.allocation;
    });
    setAllocations(currentAllocations);
  };

  const handleAllocationChange = (resourceId, value) => {
    setAllocations(prev => ({
      ...prev,
      [resourceId]: parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      const resourceAllocations = Object.entries(allocations).map(([id, allocation]) => ({
        id,
        allocation
      }));

      await onSave({
        ...project,
        resources: resourceAllocations
      });
      onClose();
    } catch (error) {
      console.error('Error saving resource allocations:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Resources"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading resources...</div>
        ) : (
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource._id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{resource.name}</h4>
                  <p className="text-sm text-gray-500">{resource.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={allocations[resource._id] || 0}
                    onChange={(e) => handleAllocationChange(resource._id, e.target.value)}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
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
            Save Allocations
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResourceManagementModal;