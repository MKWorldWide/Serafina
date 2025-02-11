import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface IUser {
  id: string;
  name: string;
  avatar?: string;
}

interface GroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participants: string[]) => void;
  availableUsers: IUser[];
}

export default function GroupChatDialog({
  open,
  onClose,
  onCreateGroup,
  availableUsers,
}: GroupChatDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName.trim(), selectedUsers);
      handleClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Group Chat</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          Select Participants
        </Typography>
        <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
          {availableUsers.map((user) => (
            <ListItem
              key={user.id}
              dense
              button
              onClick={() => handleToggleUser(user.id)}
            >
              <Checkbox
                edge="start"
                checked={selectedUsers.includes(user.id)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemAvatar>
                <Avatar src={user.avatar} alt={user.name} />
              </ListItemAvatar>
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!groupName.trim() || selectedUsers.length === 0}
          color="primary"
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
} 