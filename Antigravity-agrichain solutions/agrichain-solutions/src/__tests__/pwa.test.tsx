import { render } from '@testing-library/react';
import App from '@/app/layout';

// Mock CSS imports used in layout
jest.mock('next-i18next/app', () => ({
  appWithTranslation: (component: any) => component,
}));

// Mock next/config to prevent module resolution errors in tests
jest.mock('next/config', () => ({
  publicRuntimeConfig: {},
  serverRuntimeConfig: {}
}));

describe('PWA setup', () => {
  test('service worker register call is present', () => {
    const spy = jest.spyOn(navigator.serviceWorker, 'register').mockImplementation(async () => ({} as any));
    render(<App />);
    expect(spy).toHaveBeenCalled();
  });
});