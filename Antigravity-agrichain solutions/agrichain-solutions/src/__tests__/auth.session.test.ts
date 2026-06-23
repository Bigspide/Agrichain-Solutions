import { authConfig } from '../auth';

describe('Next‑Auth callbacks', () => {
  test('session callback copies id et email du token', async () => {
    const token = { id: '42', email: 'user@example.com' } as any;
    const session = { user: {} } as any;
    const result = await authConfig.callbacks.session({ session, token });
    expect(result.user.id).toBe('42');
    expect(result.user.email).toBe('user@example.com');
  });
});
