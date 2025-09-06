import { render, screen } from '@/__tests__/utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ExampleComponent from '@/components/ExampleComponent';

// Mock any external dependencies
vi.mock('@/hooks/useDiscord', () => ({
  useDiscord: () => ({
    user: {
      id: '123456789012345678',
      username: 'testuser',
      avatar: 'test_avatar_hash',
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('ExampleComponent', () => {
  it('renders user information', async () => {
    render(<ExampleComponent />);
    
    // Check if the component renders the user's username
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Check if the avatar is rendered with the correct alt text
    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toHaveAttribute('src', expect.stringContaining('test_avatar_hash'));
  });

  it('shows loading state', () => {
    // Override the mock for this test case
    vi.mocked(useDiscord).mockReturnValueOnce({
      user: null,
      isLoading: true,
      isError: false,
    });

    render(<ExampleComponent />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error state', () => {
    // Override the mock for this test case
    vi.mocked(useDiscord).mockReturnValueOnce({
      user: null,
      isLoading: false,
      isError: true,
    });

    render(<ExampleComponent />);
    expect(screen.getByText('Error loading user data')).toBeInTheDocument();
  });
});
