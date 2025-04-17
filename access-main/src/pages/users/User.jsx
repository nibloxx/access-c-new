
import React, { useState, useEffect, use } from 'react';
import Button from '../../components/ui/Button';
import UserTable from '../../components/users/UserTable';
import UserModal from '../../components/users/UserModal';

import { useDispatch, useSelector } from "react-redux";
import { deleteUser, fetchAllUsers } from '../../store/user/userThunk';

const User = () => {
  const dispatch= useDispatch()
  const { allUsers,user, isLoading  } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
   dispatch(fetchAllUsers())
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm('Are you sure you want to delete this user?')) return;
    // Call the deleteUser function from the Redux store
   dispatch(deleteUser({userId,onSuccess:()=>{},onError:()=>{}}))
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add User
        </Button>
      </div>

      <UserTable
        users={allUsers}
        currentUser={user}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <UserModal
      isLoading={isLoading}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
      />
    </div>
  );
};

export default User;