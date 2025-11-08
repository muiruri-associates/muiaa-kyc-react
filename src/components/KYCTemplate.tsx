import React, { useEffect, useState, useRef } from 'react';
import { MuiaaKYCClient } from '../client/MuiaaKYCClient';

export interface KYCTemplateProps {
    client: MuiaaKYCClient;
    sessionId: string;
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    frameBorder?: string;
    allowFullScreen?: boolean;
}

/**
 * React component that renders the KYC template in an iframe
 */
export const KYCTemplate: React.FC<KYCTemplateProps> = ({
    client,
    sessionId,
    width = '100%',
    height = '600px',
    className,
    style,
    onLoad,
    onError,
    frameBorder = '0',
    allowFullScreen = true,
}) => {
    const [templateUrl, setTemplateUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchTemplateUrl = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = await client.getTemplateUrlWithCredentials(sessionId);

                if (isMounted) {
                    setTemplateUrl(url);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    setError(error);
                    setLoading(false);
                    if (onError) {
                        onError(error);
                    }
                }
            }
        };

        fetchTemplateUrl();

        return () => {
            isMounted = false;
        };
    }, [client, sessionId, onError]);

    const handleIframeLoad = () => {
        setLoading(false);
        if (onLoad) {
            onLoad();
        }
    };

    if (error) {
        return (
            <div
                className={className}
                style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    color: '#d32f2f',
                    ...style,
                }}
            >
                <p>Error loading KYC template: {error.message}</p>
            </div>
        );
    }

    if (loading || !templateUrl) {
        return (
            <div
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    minHeight: typeof height === 'string' ? height : `${height}px`,
                    ...style,
                }}
            >
                <p>Loading KYC template...</p>
            </div>
        );
    }

    return (
        <iframe
            ref={iframeRef}
            src={templateUrl}
            width={width}
            height={height}
            className={className}
            style={style}
            frameBorder={frameBorder}
            allowFullScreen={allowFullScreen}
            onLoad={handleIframeLoad}
            title="KYC Verification Template"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
    );
};

