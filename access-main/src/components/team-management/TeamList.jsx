import React from 'react';
import Button from '../ui/Button';

const TeamList = ({ teams, onEdit, onDelete, hasPermission }) => {
  return (
    <div className="space-y-4">
      {teams.map(team => (
        <div key={team._id} className="border-b border-gray-200 pb-4 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{team.name}</h3>
            {hasPermission && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => onEdit(team)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(team._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-2">{team.description}</p>
          <div className="text-sm text-gray-500">
            {team.members?.length || 0} members
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamList; 