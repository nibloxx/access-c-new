import React from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const PhaseWarningModal = ({ isOpen, onClose, onConfirm, phase }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phase Warning"
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
            />
          </svg>
          <span className="text-yellow-700">
            This project is in the {phase} phase. Are you sure you want to make changes?
          </span>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Proceed
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PhaseWarningModal;