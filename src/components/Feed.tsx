import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Container, 
  CircularProgress, 
  Typography,
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { FeedItem, WebSocketMessage } from '../types/social';
import { websocketService } from '../services/websocket';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const lastItemRef = useRef<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const fetchFeedItems = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/feed?page=${page}&limit=${ITEMS_PER_PAGE}&lastItem=${lastItemRef.current || ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch feed items');
      }

      const data = await response.json();
      const newItems = data.items;

      setItems(prev => [...prev, ...newItems]);
      setHasMore(newItems.length === ITEMS_PER_PAGE);
      setPage(prev => prev + 1);
      
      if (newItems.length > 0) {
        lastItemRef.current = newItems[newItems.length - 1].id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    if (inView) {
      fetchFeedItems();
    }
  }, [inView, fetchFeedItems]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = websocketService.subscribe('post', (message: WebSocketMessage) => {
      if (message.type === 'post') {
        switch (message.action) {
          case 'create':
            setItems(prev => [message.payload, ...prev]);
            break;
          case 'update':
            setItems(prev =>
              prev.map(item =>
                item.id === message.payload.id
                  ? { ...item, ...message.payload }
                  : item
              )
            );
            break;
          case 'delete':
            setItems(prev =>
              prev.filter(item => item.id !== message.payload.id)
            );
            break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePostCreate = async (content: string) => {
    if (!user) return;

    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempPost: FeedItem = {
        id: tempId,
        type: 'post',
        content: {
          text: content,
          richText: null,
          attachments: [],
        },
        author: user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: [],
        comments: [],
        score: 0,
        position: 0,
        seen: false,
        promoted: false,
      };

      setItems(prev => [tempPost, ...prev]);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const createdPost = await response.json();

      // Update with real post data
      setItems(prev =>
        prev.map(item =>
          item.id === tempId ? { ...item, ...createdPost } : item
        )
      );
    } catch (err) {
      // Revert optimistic update
      setItems(prev => prev.filter(item => item.id !== `temp-${Date.now()}`));
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleLike = (postId: string) => {
    // Implementation of handleLike function
  };

  const handleComment = (postId: string, comment: string) => {
    // Implementation of handleComment function
  };

  const handleShare = (postId: string) => {
    // Implementation of handleShare function
  };

  const transformFeedItemToPost = (item: FeedItem) => {
    return {
      id: item.id,
      content: item.content.text,
      author: {
        id: item.author.id,
        username: item.author.username,
        avatarUrl: item.author.avatarUrl,
        rank: item.author.rank,
      },
      createdAt: item.createdAt,
      likes: item.reactions.filter(r => r.type === 'like').length,
      comments: item.comments.length,
      liked: item.reactions.some(r => r.type === 'like' && r.userId === user?.id),
      media: item.content.attachments.map(attachment => ({
        type: attachment.type as 'image' | 'video',
        url: attachment.url,
      })),
      tags: [],
    };
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Please sign in to view the feed
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: 'rgba(8, 95, 128, 0.1)',
        }}
      >
        <CreatePost onSubmit={handlePostCreate} />
      </Paper>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <PostCard
            post={transformFeedItemToPost(item)}
            ref={index === items.length - 2 ? ref : undefined}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
          {index < items.length - 1 && (
            <Divider sx={{ my: 2 }} />
          )}
        </React.Fragment>
      ))}

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      {!hasMore && items.length > 0 && (
        <Typography
          align="center"
          color="textSecondary"
          sx={{ my: 4 }}
        >
          No more posts to show
        </Typography>
      )}
    </Box>
  );
};

export default Feed; 