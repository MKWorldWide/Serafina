import { IFriend } from '../../types/social';

interface FriendsListProps {
  friends: IFriend[];
  onAcceptFriend?: (friendId: string) => void;
  onRejectFriend?: (friendId: string) => void;
  onBlockFriend?: (friendId: string) => void;
  onUnblockFriend?: (friendId: string) => void;
}

export const FriendsList = ({
  friends,
  onAcceptFriend,
  onRejectFriend,
  onBlockFriend,
  onUnblockFriend
}: FriendsListProps) => {
  const pendingFriends = friends.filter(friend => friend.friendshipStatus === 'pending');
  const acceptedFriends = friends.filter(friend => friend.friendshipStatus === 'accepted');
  const blockedFriends = friends.filter(friend => friend.friendshipStatus === 'blocked');

  return (
    <div className="friends-list">
      {pendingFriends.length > 0 && (
        <section className="friends-section">
          <h3>Pending Friend Requests</h3>
          {pendingFriends.map(friend => (
            <div key={friend.id} className="friend-item pending">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                  <span className="friend-status">{friend.status}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onAcceptFriend && (
                  <button onClick={() => onAcceptFriend(friend.id)}>Accept</button>
                )}
                {onRejectFriend && (
                  <button onClick={() => onRejectFriend(friend.id)}>Reject</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {acceptedFriends.length > 0 && (
        <section className="friends-section">
          <h3>Friends</h3>
          {acceptedFriends.map(friend => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                  <span className="friend-status">{friend.status}</span>
                  <span className="friend-since">Friends since {new Date(friend.friendSince).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onBlockFriend && (
                  <button onClick={() => onBlockFriend(friend.id)}>Block</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {blockedFriends.length > 0 && (
        <section className="friends-section">
          <h3>Blocked Users</h3>
          {blockedFriends.map(friend => (
            <div key={friend.id} className="friend-item blocked">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onUnblockFriend && (
                  <button onClick={() => onUnblockFriend(friend.id)}>Unblock</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}; 