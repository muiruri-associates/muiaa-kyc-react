// Export client
export { MuiaaKYCClient } from './client/MuiaaKYCClient';
export type {
  MuiaaKYCClientConfig,
  VerificationSession,
  CreateVerificationSessionParams,
  Document,
} from './client/MuiaaKYCClient';

// Export components
export { KYCTemplate } from './components/KYCTemplate';
export type { KYCTemplateProps } from './components/KYCTemplate';

// Export hooks
export { useKYCSession } from './hooks/useKYCSession';
export type { UseKYCSessionOptions, UseKYCSessionReturn } from './hooks/useKYCSession';

