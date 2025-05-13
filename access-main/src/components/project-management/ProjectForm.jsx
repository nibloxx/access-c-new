import React from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { PROJECT_PHASES } from '../../utils/constants';

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit,
  isEdit 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      console.error("Project name is required");
      return;
    }

    onSubmit();
  };

  const phaseOptions = Object.values(PROJECT_PHASES);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Project" : "Create Project"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Phase
            </label>
            <select
              value={formData.currentPhase}
              onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {phaseOptions.map(phase => (
                <option key={phase} value={phase}>
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
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
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;