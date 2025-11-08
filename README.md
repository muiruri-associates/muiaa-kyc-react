# @muiaa/kyc-react

React client library for Muiaa KYC API - A complete solution for identity verification and KYC (Know Your Customer) processes.

## Installation

```bash
npm install @muiaa/kyc-react
```

## Running the Example

To see a working example, navigate to the `example` directory:

```bash
cd example
npm install
npm run dev
```

The example will open in your browser at `http://localhost:3000`. Make sure your KYC API server is running at `http://kyc.muiaa.com` (or update the `baseUrl` in `example/App.tsx`).

## Features

- 🔐 **Secure Authentication**: HMAC-SHA256 signature-based API authentication
- 📄 **Document Upload**: Easy document upload for ID verification
- 🎨 **React Components**: Ready-to-use React components for KYC templates
- 🪝 **React Hooks**: Custom hooks for session management
- 📱 **TypeScript Support**: Full TypeScript definitions included
- 🌐 **Browser & Node.js**: Works in both browser and Node.js environments

## Quick Start

### 1. Initialize the Client

```typescript
import { MuiaaKYCClient } from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'ak_live_your_api_key',
  secretKey: 'sk_live_your_secret_key',
  baseUrl: 'http://kyc.muiaa.com/api/v1', // Optional, defaults to localhost
});
```

### 2. Create a Verification Session

```typescript
const session = await client.createVerificationSession({
  country_code: 'US',
  webhook_url: 'https://your-app.com/webhooks/kyc', // Optional
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

console.log('Session ID:', session.session_id);
```

### 3. Use the React Component

```tsx
import { KYCTemplate } from '@muiaa/kyc-react';

function VerificationPage() {
  return (
    <KYCTemplate
      client={client}
      sessionId={session.session_id}
      width="100%"
      height="600px"
      onLoad={() => console.log('Template loaded')}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### 4. Use the React Hook

```tsx
import { useKYCSession } from '@muiaa/kyc-react';

function VerificationPage() {
  const {
    session,
    loading,
    error,
    createSession,
    refreshSession,
    templateUrlWithCredentials,
  } = useKYCSession({
    client,
    sessionId: 'your-session-id',
    autoFetch: true,
    pollInterval: 5000, // Poll every 5 seconds (optional)
  });

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession({
        country_code: 'US',
      });
      console.log('Created session:', newSession.session_id);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {session && (
        <>
          <p>Status: {session.status}</p>
          {templateUrlWithCredentials && (
            <iframe
              src={templateUrlWithCredentials}
              width="100%"
              height="600px"
              frameBorder="0"
            />
          )}
        </>
      )}
    </div>
  );
}
```

## API Reference

### MuiaaKYCClient

#### Methods

##### `createVerificationSession(params)`

Create a new verification session.

**Parameters:**
- `params.country_code` (string, required): Two-letter country code (e.g., 'US', 'KE')
- `params.webhook_url` (string, optional): Webhook URL for notifications
- `params.template_config` (object, optional): Template configuration
- `params.metadata` (object, optional): Custom metadata

**Returns:** `Promise<VerificationSession>`

##### `uploadDocument(sessionId, file, purpose)`

Upload a document to a verification session.

**Parameters:**
- `sessionId` (string, required): Verification session ID
- `file` (File, required): File to upload
- `purpose` (string, optional): Document purpose ('id_document', 'selfie', 'proof_of_address'). Defaults to 'id_document'

**Returns:** `Promise<Document>`

##### `getVerificationSession(sessionId)`

Get verification session status.

**Parameters:**
- `sessionId` (string, required): Verification session ID

**Returns:** `Promise<VerificationSession>`

##### `listDocuments(sessionId)`

List all documents in a verification session.

**Parameters:**
- `sessionId` (string, required): Verification session ID

**Returns:** `Promise<Document[]>`

##### `getTemplateUrl(sessionId)`

Get the KYC template URL for a session.

**Parameters:**
- `sessionId` (string, required): Verification session ID

**Returns:** `Promise<string>`

##### `getTemplateUrlWithCredentials(sessionId)`

Get the full template URL with API credentials as query parameters (for iframe embedding).

**Parameters:**
- `sessionId` (string, required): Verification session ID

**Returns:** `Promise<string>`

### KYCTemplate Component

React component that renders the KYC template in an iframe.

**Props:**
- `client` (MuiaaKYCClient, required): The KYC client instance
- `sessionId` (string, required): Verification session ID
- `width` (string | number, optional): Iframe width. Defaults to '100%'
- `height` (string | number, optional): Iframe height. Defaults to '600px'
- `className` (string, optional): CSS class name
- `style` (React.CSSProperties, optional): Inline styles
- `onLoad` (function, optional): Callback when iframe loads
- `onError` (function, optional): Callback when error occurs
- `frameBorder` (string, optional): Iframe border. Defaults to '0'
- `allowFullScreen` (boolean, optional): Allow fullscreen. Defaults to true

### useKYCSession Hook

React hook for managing KYC verification sessions.

**Options:**
- `client` (MuiaaKYCClient, required): The KYC client instance
- `sessionId` (string, optional): Existing session ID
- `autoFetch` (boolean, optional): Automatically fetch session. Defaults to true
- `pollInterval` (number, optional): Poll interval in milliseconds for status updates

**Returns:**
- `session` (VerificationSession | null): Current session data
- `loading` (boolean): Loading state
- `error` (Error | null): Error state
- `createSession` (function): Function to create a new session
- `refreshSession` (function): Function to refresh current session
- `templateUrl` (string | null): Template URL without credentials
- `templateUrlWithCredentials` (string | null): Template URL with credentials for iframe

## Complete Example

```tsx
import React, { useState } from 'react';
import {
  MuiaaKYCClient,
  KYCTemplate,
  useKYCSession,
} from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'ak_live_your_api_key',
  secretKey: 'sk_live_your_secret_key',
  baseUrl: 'http://kyc.muiaa.com/api/v1',
});

function KYCVerificationPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const {
    session,
    loading,
    error,
    createSession,
  } = useKYCSession({
    client,
    sessionId: sessionId || undefined,
    autoFetch: !!sessionId,
  });

  const handleStartVerification = async () => {
    try {
      const newSession = await createSession({
        country_code: 'US',
        webhook_url: 'https://your-app.com/webhooks/kyc',
        template_config: {
          branding: {
            primary_color: '#3B82F6',
            company_name: 'My Company',
          },
        },
        metadata: {
          user_id: 'user_123',
        },
      });
      setSessionId(newSession.session_id);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  if (!sessionId) {
    return (
      <div>
        <button onClick={handleStartVerification}>
          Start KYC Verification
        </button>
      </div>
    );
  }

  if (loading) {
    return <div>Loading verification session...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>KYC Verification</h1>
      {session && (
        <>
          <p>Status: {session.status}</p>
          <KYCTemplate
            client={client}
            sessionId={sessionId}
            width="100%"
            height="600px"
            onLoad={() => console.log('Template loaded')}
            onError={(error) => console.error('Error:', error)}
          />
        </>
      )}
    </div>
  );
}

export default KYCVerificationPage;
```

## TypeScript Support

This package includes full TypeScript definitions. All types are exported and can be imported:

```typescript
import type {
  MuiaaKYCClientConfig,
  VerificationSession,
  CreateVerificationSessionParams,
  Document,
  KYCTemplateProps,
  UseKYCSessionOptions,
  UseKYCSessionReturn,
} from '@muiaa/kyc-react';
```

## Browser Compatibility

This library uses the Web Crypto API for HMAC-SHA256 signatures in browser environments. For Node.js environments, it falls back to the `crypto` module.

**Browser Requirements:**
- Modern browsers with Web Crypto API support (Chrome 37+, Firefox 34+, Safari 11+, Edge 12+)

**Node.js Requirements:**
- Node.js 12+ (for crypto module support)

## License

MIT

## Support

For issues and questions, please contact support or open an issue on the repository.

