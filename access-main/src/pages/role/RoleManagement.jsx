import { Plus, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RoleForm from '../../components/role-management/RoleForm';
import RoleTable from '../../components/role-management/RoleTable';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import { createRole, deleteRole, fetchRoles, updateRole } from '../../store/role-management/roleManagementThunk';

const RoleManagement = () => {
  const dispatch = useDispatch();
  const { roles, isLoading } = useSelector((state) => state.role);
  console.log('roles: ', roles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleOpenModal = (role = null) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
      if (selectedRole) {
        console.log('selectedRole: ', selectedRole);


      
         dispatch(updateRole({ id: selectedRole._id, formData ,onSuccess: handleCloseModal}));
      } else {
         dispatch(createRole({formData ,onSuccess: handleCloseModal}));
      }
    ;
   
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
         dispatch(deleteRole(roleId));
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      <RoleTable 
        roles={roles}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
      >
        <RoleForm
          initialData={selectedRole}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default RoleManagement;