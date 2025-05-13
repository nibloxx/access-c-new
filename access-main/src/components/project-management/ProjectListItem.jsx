import React from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PROJECT_PHASES } from '../../utils/constants';

const ProjectListItem = ({
  project,
  hasPermission,
  onEdit,
  onDelete,
  onTeamManage,
  onResourceManage
}) => {
  const getPhaseVariant = (phase) => {
    switch (phase) {
      case PROJECT_PHASES.PLANNING:
        return "bg-blue-100 text-blue-800";
      case PROJECT_PHASES.EXECUTION:
        return "bg-green-100 text-green-800";
      case PROJECT_PHASES.REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case PROJECT_PHASES.CLOSED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium">{project.name}</h3>
          <Badge variant={getPhaseVariant(project.currentPhase)}>
            {project.currentPhase}
          </Badge>
        </div>

        <div className="flex space-x-2">
          {project.currentPhase === PROJECT_PHASES.PLANNING && 
           hasPermission(project.currentPhase, 'canEditTeams') && (
            <Button
              onClick={onTeamManage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Manage Teams
            </Button>
          )}

          {project.currentPhase === PROJECT_PHASES.EXECUTION && 
           hasPermission(project.currentPhase, 'canManageResources') && (
            <Button
              onClick={onResourceManage}
              className="bg-green-600 hover:bg-green-700"
            >
              Manage Resources
            </Button>
          )}

          {hasPermission(project.currentPhase, 'canEdit') && (
            <>
              <Button
                onClick={onEdit}
                className="bg-yellow-600 hover:bg-yellow-700"
                disabled={project.currentPhase === PROJECT_PHASES.CLOSED}
              >
                Edit
              </Button>
              <Button
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={project.currentPhase === PROJECT_PHASES.CLOSED}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="text-gray-600">{project.description}</p>
    </div>
  );
};

export default ProjectListItem;