import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="serafina-theme">
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Mock for API responses
export const mockApiResponse = (status: number, data: any) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Mock for Discord.js objects
export const mockDiscordGuild = (overrides = {}) => ({
  id: '123456789012345678',
  name: 'Test Server',
  icon: 'test_icon_hash',
  owner: false,
  permissions: '2147483647',
  features: [],
  ...overrides,
});

export const mockDiscordChannel = (overrides = {}) => ({
  id: '123456789012345678',
  name: 'test-channel',
  type: 0, // Text channel
  ...overrides,
});

export const mockDiscordUser = (overrides = {}) => ({
  id: '123456789012345678',
  username: 'testuser',
  discriminator: '1234',
  avatar: 'test_avatar_hash',
  bot: false,
  ...overrides,
});

// Helper for waiting
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForElementToBeRemoved = async (selector: () => any) => {
  while (selector() !== null) {
    await sleep(100);
  }
};
