import React from 'react';

interface NavigationProps {
  user?: any;
  signOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, signOut }) => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">GameDin</span>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={signOut}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            ) : (
              <button className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 