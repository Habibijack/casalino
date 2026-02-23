export type AppEnv = {
  Variables: {
    userId: string;
    orgId: string;
    orgRole: 'admin' | 'editor' | 'viewer';
  };
};
