import React from 'react';
import { useParams } from 'react-router-dom';

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900">Game Details</h1>
          <div className="mt-4">
            <p className="text-gray-600">Loading game details for ID: {id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails; 