import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollText, Filter, Download } from 'lucide-react';
import Loading from '../../components/ui/Loading';
import { fetchAccessLogs } from '../../store/access-log/accessLogThunk';

const AccessLog = () => {
  const dispatch = useDispatch();
  const { logs, isLoading } = useSelector((state) => state.accessLog);
  const [filters, setFilters] = useState({
    action: 'all',
    granted: 'all',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    dispatch(fetchAccessLogs());
  }, [dispatch]);

  const handleExport = () => {
    const csv = logs.map(log => ({
      timestamp: new Date(log.contextData.time).toLocaleString(),
      user: log.user?.username || 'Anonymous',
      action: log.action,
      resource: log.resource,
      granted: log.granted ? 'Granted' : 'Denied',
      device: log.contextData.device,
      ipAddress: log.contextData.ipAddress
    }));

    const csvString = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Device', 'IP Address'],
      ...csv.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'access-logs.csv';
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    if (filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.granted !== 'all' && log.granted !== (filters.granted === 'true')) return false;
    if (filters.dateFrom && new Date(log.contextData.time) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(log.contextData.time) > new Date(filters.dateTo)) return false;
    return true;
  });

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ScrollText className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Access Logs</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <div className="grid grid-cols-4 gap-4 flex-1">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="access">Access</option>
            </select>

            <select
              value={filters.granted}
              onChange={(e) => setFilters({ ...filters, granted: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="true">Granted</option>
              <option value="false">Denied</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Info
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.contextData.time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {log.user?.username || 'Anonymous'}
                  </div>
                  {log.user?.email && (
                    <div className="text-sm text-gray-500">{log.user.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.resource}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.granted ? 'Granted' : 'Denied'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{log.contextData.device}</div>
                  <div className="text-xs text-gray-400">{log.contextData.ipAddress}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessLog;