import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio,
    avatar: null,
    banner: null,
    socialLinks: profile.socialLinks || {},
    gamePreferences: profile.gamePreferences || []
  });
  
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [bannerPreview, setBannerPreview] = useState(profile.bannerUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const avatarInputRef = useRef();
  const bannerInputRef = useRef();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result);
        setFormData(prev => ({ ...prev, avatar: file }));
      } else {
        setBannerPreview(reader.result);
        setFormData(prev => ({ ...prev, banner: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleGamePreferenceChange = (game, isChecked) => {
    setFormData(prev => ({
      ...prev,
      gamePreferences: isChecked
        ? [...prev.gamePreferences, game]
        : prev.gamePreferences.filter(g => g !== game)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>

          {/* Avatar & Banner Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Profile Picture</label>
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={avatarPreview} alt="Avatar Preview" />
                </div>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
              <button
                type="button"
                className="btn btn-sm mt-2"
                onClick={() => avatarInputRef.current.click()}
              >
                Change Avatar
              </button>
            </div>

            <div>
              <label className="label">Profile Banner</label>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={bannerPreview}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'banner')}
              />
              <button
                type="button"
                className="btn btn-sm mt-2"
                onClick={() => bannerInputRef.current.click()}
              >
                Change Banner
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows="3"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-2">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['twitch', 'youtube', 'twitter', 'discord'].map(platform => (
                <div key={platform}>
                  <label className="label capitalize">{platform}</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.socialLinks[platform] || ''}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                    placeholder={`Your ${platform} link`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Game Preferences */}
          <div>
            <h3 className="font-semibold mb-2">Game Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['FPS', 'MOBA', 'RPG', 'Strategy', 'Sports', 'Racing'].map(game => (
                <label key={game} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.gamePreferences.includes(game)}
                    onChange={(e) => handleGamePreferenceChange(game, e.target.checked)}
                  />
                  <span>{game}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProfileModal; 