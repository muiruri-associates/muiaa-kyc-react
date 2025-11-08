# Fixing CORS Issues

The "Failed to fetch" error is almost always caused by CORS (Cross-Origin Resource Sharing) blocking the request.

## Quick Fix for Django

Add this to your Django `settings.py`:

```python
# Install django-cors-headers if not already installed
# pip install django-cors-headers

INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
    # ... other apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this at the top
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development only (NOT for production):
# CORS_ALLOW_ALL_ORIGINS = True

# Allow credentials if needed
CORS_ALLOW_CREDENTIALS = True

# Allow the required headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-signature',
    'x-timestamp',
]
```

## Verify CORS is Working

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try creating a session
4. Look for the request to `/api/v1/verifications/`
5. Check the Response Headers - you should see:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: ...` (should include X-Signature, X-Timestamp)

## If CORS is Still Not Working

1. **Restart Django server** after changing CORS settings
2. **Clear browser cache** or use incognito mode
3. **Check Django logs** for CORS-related errors
4. **Verify the origin** - make sure `http://localhost:3000` matches exactly (no trailing slash)

## Alternative: Use a Proxy

If you can't modify CORS settings, you can use Vite's proxy:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://kyc.muiaa.com',
        changeOrigin: true,
      },
    },
  },
});
```

Then change the baseUrl to:
```typescript
baseUrl: '/api/v1'  // Relative URL, will use proxy
```

