import React from 'react';

const Games: React.FC = () => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Games</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {/* Game cards will be rendered here */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Loading games...</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games; 