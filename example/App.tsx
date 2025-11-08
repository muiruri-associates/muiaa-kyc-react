import { useState } from 'react';
import {
    MuiaaKYCClient,
    KYCTemplate,
    useKYCSession,
} from '../src';

// Enable debug logging (set to false in production)
if (typeof window !== 'undefined') {
    (window as any).__DEBUG_KYC__ = true;
}

// Initialize the client
const client = new MuiaaKYCClient({
    apiKeyId: 'ak_live_LC3PxN8PG7ZkN2gmXJA3ZiKwEoskPCFi',
    secretKey: 'sk_live_ONQbpn7NccmbEKO7hm4ay5SQN9cmS1mb9NU40MWfZQtsoJelFMGzoolO0wmgH74b',
    baseUrl: 'http://kyc.muiaa.com/api/v1',
});

/**
 * Example React component demonstrating KYC verification flow
 */
function KYCVerificationApp() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const {
        session,
        loading,
        error,
        createSession,
        refreshSession,
        templateUrlWithCredentials,
    } = useKYCSession({
        client,
        sessionId: sessionId || undefined,
        autoFetch: !!sessionId,
        pollInterval: undefined, // Disabled - no auto-refresh
    });

    const handleStartVerification = async () => {
        try {
            const baseUrl = client.getBaseUrl();
            console.log('Creating session with API:', baseUrl);

            const newSession = await createSession({
                country_code: 'US',
                webhook_url: 'https://your-app.com/webhooks/kyc',
                template_config: {
                    branding: {
                        primary_color: '#3B82F6',
                        company_name: 'My Company',
                    },
                    required_fields: ['id_document', 'selfie'],
                },
                metadata: {
                    user_id: 'user_123',
                    order_id: 'order_456',
                },
            });
            setSessionId(newSession.session_id);
            console.log('Session created:', newSession.session_id);
        } catch (err) {
            console.error('Failed to create session:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            alert(`Failed to create session:\n\n${errorMessage}\n\nPlease check:\n1. Is the API server running at http://kyc.muiaa.com?\n2. Check browser console for CORS errors`);
        }
    };

    const handleRefresh = async () => {
        await refreshSession();
    };

    if (!sessionId) {
        return (
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                <h1>KYC Verification</h1>
                <p>Click the button below to start the verification process.</p>
                <button
                    onClick={handleStartVerification}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Start KYC Verification
                </button>
            </div>
        );
    }

    if (loading && !session) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading verification session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: '#d32f2f' }}>
                <h2>Error</h2>
                <p>{error.message}</p>
                <button onClick={handleRefresh}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>KYC Verification</h1>

            {session && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <strong>Session ID:</strong> {session.session_id}
                        </div>
                        <div>
                            <strong>Status:</strong> {session.status}
                        </div>
                        <button onClick={handleRefresh}>Refresh Status</button>
                    </div>

                    {session.ocr_confidence && (
                        <div>
                            <strong>OCR Confidence:</strong> {(session.ocr_confidence * 100).toFixed(2)}%
                        </div>
                    )}
                </div>
            )}

            <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <KYCTemplate
                    client={client}
                    sessionId={sessionId}
                    width="100%"
                    height="600px"
                    onLoad={() => console.log('KYC template loaded successfully')}
                    onError={(error) => {
                        console.error('Error loading template:', error);
                        alert(`Error loading template: ${error.message}`);
                    }}
                />
            </div>

            {templateUrlWithCredentials && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Template URL:</strong></p>
                    <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {templateUrlWithCredentials}
                    </code>
                </div>
            )}
        </div>
    );
}

export default KYCVerificationApp;

