import { useState } from 'react';
import { IUser } from '../../types/social';

interface GroupChatDialogProps {
  users: IUser[];
  onCreateGroup: (groupName: string, participants: string[]) => void;
  onClose: () => void;
}

export const GroupChatDialog = ({ users, onCreateGroup, onClose }: GroupChatDialogProps) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName, selectedUsers);
      onClose();
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
    );
  };

  return (
    <div className='group-chat-dialog'>
      <h2>Create Group Chat</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='groupName'>Group Name</label>
          <input
            type='text'
            id='groupName'
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder='Enter group name'
            required
          />
        </div>

        <div className='form-group'>
          <label>Select Participants</label>
          <div className='users-list'>
            {users.map(user => (
              <div key={user.id} className='user-item'>
                <label className='user-checkbox'>
                  <input
                    type='checkbox'
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <div className='user-info'>
                    <img
                      src={user.picture || user.avatar}
                      alt={user.username}
                      className='user-avatar'
                    />
                    <span className='user-name'>{user.name || user.username}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className='dialog-actions'>
          <button type='button' onClick={onClose}>
            Cancel
          </button>
          <button type='submit' disabled={!groupName.trim() || selectedUsers.length === 0}>
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};
