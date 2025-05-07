import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AvatarDropdown = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        navigate('/user-profile');
        setIsOpen(false);
    };

    const getInitials = () => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        return user.username ? user.username[0].toUpperCase() : 'U';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {getInitials()}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.email}
                        </p>
                    </div>
                    <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Profile Settings
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarDropdown; 