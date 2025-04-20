import React from 'react';
import { Filter } from 'lucide-react';

const ResourceFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <Filter size={20} className="text-gray-500" />
        <div className="grid grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="document">Document</option>
            <option value="application">Application</option>
            <option value="database">Database</option>
          </select>

          <select
            value={filters.access}
            onChange={(e) => onFilterChange({ ...filters, access: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Access Levels</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.team}
            onChange={(e) => onFilterChange({ ...filters, team: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Teams</option>
            <option value="development">Development</option>
            <option value="operations">Operations</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResourceFilter;