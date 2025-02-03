import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      friends: [],
      friendRequests: [],
      notifications: [],
      unreadNotifications: 0,
      
      // Theme state
      theme: 'dark',
      
      // Chat state
      conversations: {},
      activeConversation: null,
      unreadMessages: {},
      
      // Activity Feed state
      activities: [],
      
      // Actions - User
      setUser: (user) => set({ user }),
      updateUserProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
      
      // Actions - Friends
      setFriends: (friends) => set({ friends }),
      addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend]
      })),
      removeFriend: (friendId) => set((state) => ({
        friends: state.friends.filter(f => f.id !== friendId)
      })),
      setFriendRequests: (requests) => set({ friendRequests: requests }),
      addFriendRequest: (request) => set((state) => ({
        friendRequests: [...state.friendRequests, request]
      })),
      removeFriendRequest: (requestId) => set((state) => ({
        friendRequests: state.friendRequests.filter(r => r.id !== requestId)
      })),
      
      // Actions - Notifications
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      })),
      markNotificationsAsRead: () => set({ unreadNotifications: 0 }),
      clearNotifications: () => set({ notifications: [], unreadNotifications: 0 }),
      
      // Actions - Theme
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),
      
      // Actions - Chat
      setConversations: (conversations) => set({ conversations }),
      addMessage: (conversationId, message) => set((state) => {
        const conversation = state.conversations[conversationId] || [];
        return {
          conversations: {
            ...state.conversations,
            [conversationId]: [...conversation, message]
          },
          unreadMessages: {
            ...state.unreadMessages,
            [conversationId]: (state.unreadMessages[conversationId] || 0) + 
              (state.activeConversation !== conversationId ? 1 : 0)
          }
        };
      }),
      setActiveConversation: (conversationId) => set((state) => ({
        activeConversation: conversationId,
        unreadMessages: {
          ...state.unreadMessages,
          [conversationId]: 0
        }
      })),
      
      // Actions - Activities
      setActivities: (activities) => set({ activities }),
      addActivity: (activity) => set((state) => ({
        activities: [activity, ...state.activities]
      })),
      updateActivity: (activityId, updates) => set((state) => ({
        activities: state.activities.map(activity =>
          activity.id === activityId ? { ...activity, ...updates } : activity
        )
      })),
      
      // Reset state
      logout: () => set({
        user: null,
        friends: [],
        friendRequests: [],
        notifications: [],
        unreadNotifications: 0,
        conversations: {},
        activeConversation: null,
        unreadMessages: {},
        activities: []
      })
    }),
    {
      name: 'gamedin-store',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user
      })
    }
  )
)

export default useStore 