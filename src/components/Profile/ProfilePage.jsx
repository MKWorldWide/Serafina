import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import api from '../../lib/api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import AchievementCard from './AchievementCard';
import MutualFriends from './MutualFriends';
import UserActivity from './UserActivity';
import EditProfileModal from './EditProfileModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = useStore(state => state.user);
  const isOwnProfile = currentUser?.id === userId;

  // Fetch profile data with React Query
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/achievements`);
      return data;
    },
    enabled: !!profile,
  });

  const handleProfileUpdate = async updates => {
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, JSON.stringify(value));
        }
      });

      await api.patch(`/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      queryClient.invalidateQueries(['profile', userId]);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Failed to load profile. Please try again later.</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-80 rounded-xl overflow-hidden mb-6"
      >
        <img
          src={profile.bannerUrl || '/default-banner.jpg'}
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 btn btn-primary btn-sm"
          >
            Edit Profile
          </button>
        )}
      </motion.div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={profile.avatar} alt={profile.username} />
                </div>
              </div>
              <h2 className="card-title mt-4">{profile.username}</h2>
              <p className="text-sm opacity-70">{profile.bio}</p>

              <div className="stats stats-vertical shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Games</div>
                  <div className="stat-value">{profile.gamesCount}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Friends</div>
                  <div className="stat-value">{profile.friendsCount}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Achievements</div>
                  <div className="stat-value">{achievements?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mutual Friends */}
          {!isOwnProfile && <MutualFriends userId={userId} />}
        </motion.div>

        {/* Middle Column - Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6"
        >
          <UserActivity userId={userId} />
        </motion.div>

        {/* Right Column - Achievements & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Achievements</h3>
              <div className="space-y-4 mt-4">
                {achievements?.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <EditProfileModal
            profile={profile}
            onClose={() => setIsEditing(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
