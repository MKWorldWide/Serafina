import React from 'react';
import { useStore } from '../../store/useStore';
import { ISettings } from '../../types/store';

export const Settings = () => {
  const store = useStore(state => ({
    user: state.user,
    settings: state.settings,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    darkMode: state.darkMode,
    updateSettings: state.updateSettings,
    toggleDarkMode: state.toggleDarkMode,
    logout: state.logout,
  }));

  const handleEmailFrequencyChange = (frequency: 'daily' | 'weekly' | 'real-time') => {
    store.updateSettings({
      notifications: {
        ...store.settings.notifications,
        emailNotifications: {
          ...store.settings.notifications.emailNotifications,
          frequency,
        },
      },
    });
  };

  const handleNotificationTypeToggle = (
    type: keyof ISettings['notifications']['emailNotifications']['types'],
  ) => {
    store.updateSettings({
      notifications: {
        ...store.settings.notifications,
        emailNotifications: {
          ...store.settings.notifications.emailNotifications,
          types: {
            ...store.settings.notifications.emailNotifications.types,
            [type]: !store.settings.notifications.emailNotifications.types[type],
          },
        },
      },
    });
  };

  const handleNotificationChange = (
    key: keyof ISettings['notifications']['emailNotifications'],
    value: any,
  ) => {
    store.updateSettings({
      notifications: {
        ...store.settings.notifications,
        emailNotifications: {
          ...store.settings.notifications.emailNotifications,
          [key]: value,
        },
      },
    });
  };

  const handlePrivacyChange = (key: keyof ISettings['privacy']) => {
    store.updateSettings({
      privacy: {
        ...store.settings.privacy,
        [key]: !store.settings.privacy[key],
      },
    });
  };

  const handleSettingChange = (key: keyof ISettings, value: any) => {
    store.updateSettings({
      [key]: value,
    });
  };

  if (store.loading) return <div>Loading...</div>;
  if (store.error) return <div>Error: {store.error}</div>;
  if (!store.isAuthenticated || !store.user) return <div>Please log in to access settings</div>;

  return (
    <div className='settings-container'>
      <h1>Settings</h1>

      {/* Profile Section */}
      <section>
        <h2>Profile</h2>
        <div className='profile-settings'>
          <img
            src={store.user.picture || store.user.avatar}
            alt={store.user.username}
            className='profile-picture'
          />
          <div className='profile-info'>
            <input
              type='text'
              defaultValue={store.user.username}
              disabled
              className='username-input'
            />
            <textarea
              defaultValue={store.user.bio}
              placeholder='Add a bio...'
              className='bio-input'
            />
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section>
        <h2>Appearance</h2>
        <div className='appearance-settings'>
          <label>
            <input type='checkbox' checked={store.darkMode} onChange={store.toggleDarkMode} />
            Dark Mode
          </label>
          <label>
            <input
              type='checkbox'
              checked={store.settings.privacy.showOnlineStatus}
              onChange={e => handlePrivacyChange('showOnlineStatus')}
            />
            Show Online Status
          </label>
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <h2>Notifications</h2>
        <div className='notification-settings'>
          <div>
            <h3>Email Frequency</h3>
            <select
              value={store.settings.notifications.emailNotifications.frequency}
              onChange={e =>
                handleEmailFrequencyChange(e.target.value as 'daily' | 'weekly' | 'real-time')
              }
            >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='real-time'>Real-time</option>
            </select>
          </div>

          {store.settings.notifications.emailNotifications.frequency !== 'none' && (
            <div>
              {store.settings.notifications.emailNotifications.frequency !== 'real-time' && (
                <div>
                  <h3>Email Time</h3>
                  <select>
                    <option value='morning'>Morning (8 AM)</option>
                    <option value='afternoon'>Afternoon (1 PM)</option>
                    <option value='evening'>Evening (6 PM)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <h3>Notification Types</h3>
            {Object.entries(store.settings.notifications.emailNotifications.types).map(
              ([type, enabled]) => (
                <label key={type}>
                  <input
                    type='checkbox'
                    checked={enabled}
                    onChange={() =>
                      handleNotificationTypeToggle(
                        type as keyof ISettings['notifications']['emailNotifications']['types'],
                      )
                    }
                  />
                  {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section>
        <h2>Privacy</h2>
        <div className='privacy-settings'>
          {Object.entries(store.settings.privacy).map(([key, value]) => (
            <label key={key}>
              <input
                type='checkbox'
                checked={value}
                onChange={() => handlePrivacyChange(key as keyof ISettings['privacy'])}
              />
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
          ))}
        </div>
      </section>

      {/* Account Actions */}
      <section>
        <h2>Account</h2>
        <div className='account-actions'>
          <button onClick={() => store.logout()} className='logout-button'>
            Log Out
          </button>
        </div>
      </section>
    </div>
  );
};
