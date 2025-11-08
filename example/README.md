# Muiaa KYC React - Example

This is an example application demonstrating how to use the `@muiaa/kyc-react` package.

## Prerequisites

- Node.js 18+ installed
- The KYC API server running at `http://kyc.muiaa.com` (or update the `baseUrl` in `App.tsx`)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure your API credentials are set in `App.tsx`:
```typescript
const client = new MuiaaKYCClient({
  apiKeyId: 'your_api_key',
  secretKey: 'your_secret_key',
  baseUrl: 'http://kyc.muiaa.com/api/v1',
});
```

## Running the Example

Start the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

## What the Example Demonstrates

- Creating a KYC verification session
- Using the `KYCTemplate` component to display the verification form
- Using the `useKYCSession` hook for session management
- Handling loading and error states
- Polling for session status updates

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

