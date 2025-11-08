import { useState, useEffect, useCallback } from 'react';
import { MuiaaKYCClient, VerificationSession, CreateVerificationSessionParams } from '../client/MuiaaKYCClient';

export interface UseKYCSessionOptions {
  client: MuiaaKYCClient;
  sessionId?: string;
  autoFetch?: boolean;
  pollInterval?: number;
}

export interface UseKYCSessionReturn {
  session: VerificationSession | null;
  loading: boolean;
  error: Error | null;
  createSession: (params: CreateVerificationSessionParams) => Promise<VerificationSession>;
  refreshSession: () => Promise<void>;
  templateUrl: string | null;
  templateUrlWithCredentials: string | null;
}

/**
 * React hook for managing KYC verification sessions
 */
export const useKYCSession = (options: UseKYCSessionOptions): UseKYCSessionReturn => {
  const { client, sessionId, autoFetch = true, pollInterval } = options;
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [templateUrlWithCredentials, setTemplateUrlWithCredentials] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const sessionData = await client.getVerificationSession(sessionId);
      setSession(sessionData);

      // Get template URLs
      const url = sessionData.kyc_template_url || '';
      setTemplateUrl(url);

      if (url) {
        try {
          const urlWithCreds = await client.getTemplateUrlWithCredentials(sessionId);
          setTemplateUrlWithCredentials(urlWithCreds);
        } catch (err) {
          // Ignore errors for URL with credentials
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [client, sessionId]);

  const createSession = useCallback(
    async (params: CreateVerificationSessionParams): Promise<VerificationSession> => {
      try {
        setLoading(true);
        setError(null);
        const newSession = await client.createVerificationSession(params);
        setSession(newSession);

        // Get template URLs
        const url = newSession.kyc_template_url || '';
        setTemplateUrl(url);

        if (url) {
          try {
            const urlWithCreds = await client.getTemplateUrlWithCredentials(newSession.session_id);
            setTemplateUrlWithCredentials(urlWithCreds);
          } catch (err) {
            // Ignore errors for URL with credentials
          }
        }

        return newSession;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (autoFetch && sessionId) {
      fetchSession();
    }
  }, [autoFetch, sessionId, fetchSession]);

  // Polling effect
  useEffect(() => {
    if (!pollInterval || !sessionId || !autoFetch) return;

    const interval = setInterval(() => {
      fetchSession();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, sessionId, autoFetch, fetchSession]);

  return {
    session,
    loading,
    error,
    createSession,
    refreshSession,
    templateUrl,
    templateUrlWithCredentials,
  };
};

