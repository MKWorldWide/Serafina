import React from 'react';

interface ProfileProps {
  user?: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {user ? (
            <div className="mt-4">
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
          ) : (
            <p className="text-gray-600">Please sign in to view your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 