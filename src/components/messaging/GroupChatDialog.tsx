import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Group as GroupIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AddPersonIcon,
  PersonRemove as RemovePersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { User, IConversationParticipant } from '../../types/social';

interface GroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup?: (data: GroupChatCreateData) => Promise<void>;
  onUpdateGroup?: (data: GroupChatUpdateData) => Promise<void>;
  existingGroup?: {
    id: string;
    name: string;
    avatar?: string;
    participants: IConversationParticipant[];
  };
  availableUsers: User[];
  currentUser: User;
}

export interface GroupChatCreateData {
  name: string;
  avatar?: File;
  participants: string[]; // User IDs
}

export interface GroupChatUpdateData extends GroupChatCreateData {
  id: string;
  removedParticipants?: string[]; // User IDs to remove
  newAdmins?: string[]; // User IDs to promote to admin
  removedAdmins?: string[]; // User IDs to demote from admin
}

const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  open,
  onClose,
  onCreateGroup,
  onUpdateGroup,
  existingGroup,
  availableUsers,
  currentUser,
}) => {
  const [name, setName] = useState(existingGroup?.name || '');
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    existingGroup?.participants.map((p) => p.user) || []
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    existingGroup?.avatar || ''
  );
  const [removedUsers, setRemovedUsers] = useState<User[]>([]);
  const [newAdmins, setNewAdmins] = useState<User[]>([]);
  const [removedAdmins, setRemovedAdmins] = useState<User[]>([]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedUsers.length === 0) return;

    const data = {
      name: name.trim(),
      avatar: avatar || undefined,
      participants: selectedUsers.map((user) => user.id),
    };

    if (existingGroup) {
      await onUpdateGroup?.({
        ...data,
        id: existingGroup.id,
        removedParticipants: removedUsers.map((user) => user.id),
        newAdmins: newAdmins.map((user) => user.id),
        removedAdmins: removedAdmins.map((user) => user.id),
      });
    } else {
      await onCreateGroup?.(data);
    }

    onClose();
  };

  const isAdmin = (userId: string) => {
    return (
      existingGroup?.participants.find(
        (p) => p.user.id === userId && p.role === 'admin'
      ) !== undefined
    );
  };

  const canManageUsers = (userId: string) => {
    return (
      currentUser.id === existingGroup?.participants.find((p) => p.role === 'owner')?.user.id ||
      (isAdmin(currentUser.id) && !isAdmin(userId))
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existingGroup ? 'Edit Group Chat' : 'Create Group Chat'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Group avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <GroupIcon sx={{ fontSize: 40 }} />
            )}
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
              }}
            >
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <PhotoIcon fontSize="small" />
            </IconButton>
          </Box>
          <TextField
            sx={{ ml: 2, flex: 1 }}
            label="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Participants
        </Typography>
        {existingGroup ? (
          <List>
            {existingGroup.participants.map((participant) => (
              <ListItem key={participant.user.id}>
                <ListItemAvatar>
                  <Avatar
                    src={participant.user.avatarUrl}
                    alt={participant.user.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {participant.user.username}
                      {participant.role === 'owner' && (
                        <Chip size="small" label="Owner" color="primary" />
                      )}
                      {participant.role === 'admin' && (
                        <Chip size="small" label="Admin" color="secondary" />
                      )}
                    </Box>
                  }
                  secondary={participant.isOnline ? 'Online' : 'Offline'}
                />
                {canManageUsers(participant.user.id) && (
                  <ListItemSecondaryAction>
                    {!isAdmin(participant.user.id) ? (
                      <IconButton
                        onClick={() => setNewAdmins([...newAdmins, participant.user])}
                      >
                        <AdminIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() =>
                          setRemovedAdmins([...removedAdmins, participant.user])
                        }
                      >
                        <RemovePersonIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() =>
                        setRemovedUsers([...removedUsers, participant.user])
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(option) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Add participants..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  avatar={<Avatar src={option.avatarUrl} />}
                  label={option.username}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar
                  src={option.avatarUrl}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                {option.username}
              </Box>
            )}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || selectedUsers.length === 0}
        >
          {existingGroup ? 'Save Changes' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupChatDialog; 