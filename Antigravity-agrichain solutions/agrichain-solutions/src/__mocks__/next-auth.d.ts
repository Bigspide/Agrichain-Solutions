declare module 'next-auth' {
  export const NextAuth: any;
  export type DefaultSession = any;
  export type NextAuthConfig = any;
}

declare module 'next-auth/providers/credentials' {
  const Credentials: any;
  export default Credentials;
}
