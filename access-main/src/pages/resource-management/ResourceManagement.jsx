
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database, Plus, Filter } from 'lucide-react';
import { createResource, deleteResource, fetchResources, updateResource } from '../../store/resource-management/resourceManagementThunk';
import ResourceFilter from '../../components/resource-management/ResourceFilter';
import ResourceTable from '../../components/resource-management/ResourceTable';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import ResourceForm from '../../components/resource-management/ResourceForm';

const ResourceManagement = () => {
  const dispatch = useDispatch();
  const { resources, isLoading } = useSelector((state) => state.resource);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    access: 'all',
    team: 'all'
  });

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const handleOpenModal = (resource = null) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedResource(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedResource) {
         dispatch(updateResource({ id: selectedResource._id, data: formData }));
      } else {
         dispatch(createResource(formData));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
         dispatch(deleteResource(resourceId));
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const filteredResources = resources.filter(resource => {
    if (filters.type !== 'all' && resource.type !== filters.type) return false;
    if (filters.access !== 'all' && resource.accessLevel !== filters.access) return false;
    if (filters.team !== 'all' && !resource.teams.includes(filters.team)) return false;
    return true;
  });
  console.log('filteredResources: ', filteredResources);

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Resource
          </button>
        </div>
      </div>

      <div className="mb-6">
        <ResourceFilter
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      <ResourceTable 
        resources={filteredResources}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedResource ? 'Edit Resource' : 'Add New Resource'}
      >
        <ResourceForm
          initialData={selectedResource}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ResourceManagement;