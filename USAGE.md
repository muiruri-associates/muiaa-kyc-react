# Usage Examples

## Basic Usage

### 1. Simple Component Usage

```tsx
import React from 'react';
import { MuiaaKYCClient, KYCTemplate } from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'your_api_key',
  secretKey: 'your_secret_key',
  baseUrl: 'http://kyc.muiaa.com/api/v1',
});

function MyComponent() {
  const sessionId = 'your-session-id';

  return (
    <KYCTemplate
      client={client}
      sessionId={sessionId}
      width="100%"
      height="600px"
    />
  );
}
```

### 2. Using the Hook

```tsx
import React from 'react';
import { MuiaaKYCClient, useKYCSession } from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'your_api_key',
  secretKey: 'your_secret_key',
});

function VerificationComponent() {
  const { session, loading, createSession } = useKYCSession({
    client,
  });

  const handleStart = async () => {
    await createSession({
      country_code: 'US',
    });
  };

  return (
    <div>
      <button onClick={handleStart}>Start Verification</button>
      {loading && <p>Loading...</p>}
      {session && <p>Status: {session.status}</p>}
    </div>
  );
}
```

### 3. Complete Flow Example

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

function CompleteKYCFlow() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session, createSession, loading } = useKYCSession({
    client,
    sessionId: sessionId || undefined,
  });

  const startVerification = async () => {
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
      });
      setSessionId(newSession.session_id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  if (!sessionId) {
    return (
      <div>
        <h1>Start KYC Verification</h1>
        <button onClick={startVerification}>Start</button>
      </div>
    );
  }

  return (
    <div>
      <h1>KYC Verification</h1>
      {session && <p>Status: {session.status}</p>}
      <KYCTemplate
        client={client}
        sessionId={sessionId}
        width="100%"
        height="600px"
      />
    </div>
  );
}
```

## Direct Iframe Usage

If you prefer to use the iframe directly without the component:

```tsx
import { MuiaaKYCClient } from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'your_api_key',
  secretKey: 'your_secret_key',
});

// Get the template URL with credentials
const templateUrl = await client.getTemplateUrlWithCredentials(sessionId);

// Use in your JSX
<iframe
  src={templateUrl}
  width="100%"
  height="600px"
  frameBorder="0"
/>
```

## Document Upload

```tsx
import { MuiaaKYCClient } from '@muiaa/kyc-react';

const client = new MuiaaKYCClient({
  apiKeyId: 'your_api_key',
  secretKey: 'your_secret_key',
});

// Upload a document
const fileInput = document.querySelector('input[type="file"]');
if (fileInput && fileInput.files && fileInput.files[0]) {
  const file = fileInput.files[0];
  const document = await client.uploadDocument(
    sessionId,
    file,
    'id_document' // or 'selfie', 'proof_of_address'
  );
  console.log('Document uploaded:', document);
}
```

