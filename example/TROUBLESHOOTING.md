# Troubleshooting Guide

## Common Issues

### 1. "Failed to fetch" Error

This error typically occurs when:

#### API Server Not Running
- **Solution**: Make sure your KYC API server is running at `http://kyc.muiaa.com`
- **Check**: Open `http://kyc.muiaa.com/api/v1/verifications/` in your browser or use curl:
  ```bash
  curl http://kyc.muiaa.com/api/v1/verifications/
  ```

#### CORS Issues
If you see CORS errors in the browser console, the API server needs to allow requests from `http://localhost:3000`.

**For Django (if that's your backend):**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development:
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

**For other backends**, make sure CORS headers are set:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Signature, X-Timestamp
```

#### Wrong API URL
- Check that `baseUrl` in `App.tsx` matches your API server URL
- Default is `http://kyc.muiaa.com/api/v1`
- If your API is on a different port or domain, update it

### 2. "NetworkError" or Connection Refused

- Check if the API server is actually running
- Verify the port (8000) is correct
- Check firewall settings
- Try accessing the API directly in your browser

### 3. Authentication Errors

- Verify your `apiKeyId` and `secretKey` are correct
- Check that the API keys are active and have the right permissions
- Ensure the HMAC signature is being generated correctly (check browser console for signature details)

### 4. Template Not Loading

- Make sure the session was created successfully first
- Check that `kyc_template_url` is returned in the session response
- Verify the template endpoint is accessible (it should be at `/templates/{session_id}/`)

## Debugging Steps

1. **Check Browser Console**: Look for detailed error messages
2. **Check Network Tab**: 
   - Open DevTools → Network tab
   - Try creating a session
   - Check the failed request and see the status code and response
3. **Test API Directly**:
   ```bash
   # Test if API is reachable
   curl http://kyc.muiaa.com/api/v1/verifications/
   
   # Test with authentication (you'll need to generate HMAC signature)
   ```
4. **Check API Server Logs**: Look for errors on the backend

## Quick Test

To quickly test if the API is accessible:

1. Open browser console
2. Run:
   ```javascript
   fetch('http://kyc.muiaa.com/api/v1/verifications/')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

If this fails, the API server is not running or not accessible.

