import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleColor = () => {
    if (userProfile?.role === 'admin') return 'text-purple-600';
    if (userProfile?.role === 'issuer') return 'text-blue-600';
    return 'text-green-600';
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/admin')) return 'Admin Dashboard';
    if (location.pathname.includes('/issuer')) return 'Issuer Portal';
    return 'DocVerify Platform';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-xs text-gray-500">Secure Document Verification</p>
            </div>
          </div>

          {currentUser && userProfile && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{currentUser.email}</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getRoleColor()}`}>
                  {userProfile.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;