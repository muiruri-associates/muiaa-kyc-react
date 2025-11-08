/**
 * Muiaa KYC API Client
 * 
 * TypeScript/JavaScript client for interacting with the Muiaa-KYC API
 */

export interface MuiaaKYCClientConfig {
  apiKeyId: string;
  secretKey: string;
  baseUrl?: string;
}

export interface VerificationSession {
  session_id: string;
  status: string;
  country_code: string;
  kyc_template_url?: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  ocr_confidence?: number;
  document_type_data?: any;
  result?: any;
}

export interface CreateVerificationSessionParams {
  country_code: string;
  webhook_url?: string;
  template_config?: {
    branding?: {
      primary_color?: string;
      company_name?: string;
    };
    required_fields?: string[];
  };
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  file: string;
  purpose: string;
  purpose_display: string;
  file_size_mb: number;
  created_at?: string;
}

export class MuiaaKYCClient {
  private apiKeyId: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: MuiaaKYCClientConfig) {
    this.apiKeyId = config.apiKeyId;
    this.secretKey = config.secretKey;
    this.baseUrl = (config.baseUrl || 'http://kyc.muiaa.com/api/v1').replace(/\/$/, '');
  }

  /**
   * Get the base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Test if the API server is reachable
   * This tries to make a simple GET request to a known endpoint
   */
  async testConnection(): Promise<{ reachable: boolean; error?: string }> {
    try {
      // Try to make a simple request to check connectivity
      // We'll use a GET request to /verifications/ which should return some response
      const testUrl = `${this.baseUrl}/verifications/`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKeyId}`,
        },
      });
      // Any response (even 401/403) means server is reachable
      return { reachable: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { reachable: false, error: errorMsg };
    }
  }

  /**
   * Generate HMAC-SHA256 signature for API requests
   */
  private async signRequest(
    method: string,
    path: string,
    body: string = '',
    timestamp?: string
  ): Promise<{ signature: string; timestamp: string }> {
    if (!timestamp) {
      timestamp = Math.floor(Date.now() / 1000).toString();
    }

    // For multipart/form-data, use empty string
    if (body === null || body === undefined) {
      body = '';
    }

    const message = `${method}\n${path}\n${body}\n${timestamp}`;

    // Create HMAC signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secretKey);
    const messageData = encoder.encode(message);

    // Use Web Crypto API for HMAC-SHA256
    const signature = await this.hmacSha256(keyData, messageData);
    const signatureHex = Array.from(signature)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      signature: `sha256=${signatureHex}`,
      timestamp,
    };
  }

  /**
   * HMAC-SHA256 implementation using Web Crypto API
   */
  private async hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser environment
      // Create new ArrayBuffers to ensure compatibility
      const keyBuffer = new Uint8Array(key).buffer;
      const dataBuffer = new Uint8Array(data).buffer;
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer as ArrayBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer as ArrayBuffer);
      return new Uint8Array(signature);
    } else {
      // Node.js environment - use crypto module
      try {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', Buffer.from(key));
        hmac.update(Buffer.from(data));
        return new Uint8Array(hmac.digest());
      } catch (e) {
        throw new Error('HMAC-SHA256 requires Node.js crypto module or browser Web Crypto API');
      }
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    method: string,
    path: string,
    data?: any,
    files?: { file: File; purpose: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const urlObj = new URL(url);
    const requestPath = urlObj.pathname;

    // Prepare body for signature calculation
    let body = '';
    if (files) {
      // For FormData (multipart), use empty string for signature
      body = '';
    } else if (data && !files) {
      // Stringify body exactly as it will be sent
      body = JSON.stringify(data);
    }

    // Generate signature
    const { signature, timestamp } = await this.signRequest(method, requestPath, body);

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.apiKeyId}`,
      'X-Signature': signature,
      'X-Timestamp': timestamp,
    };

    if (!files) {
      headers['Content-Type'] = 'application/json';
    }

    // Debug logging (can be removed in production)
    if (typeof window !== 'undefined' && (window as any).__DEBUG_KYC__) {
      console.log('[KYC Client] Request:', {
        method,
        url,
        path: requestPath,
        body,
        signature,
        timestamp,
        headers: { ...headers, Authorization: 'Bearer ***' },
      });
    }

    try {
      let response: Response;

      if (files) {
        const formData = new FormData();
        formData.append('file', files.file);
        formData.append('purpose', files.purpose);

        response = await fetch(url, {
          method,
          headers,
          body: formData,
        });
      } else {
        const requestBody = data ? JSON.stringify(data) : undefined;
        response = await fetch(url, {
          method,
          headers,
          body: requestBody,
        });
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(`API Error: ${errorData.error || errorData.message || JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      
      // Debug logging
      if (typeof window !== 'undefined' && (window as any).__DEBUG_KYC__) {
        console.log('[KYC Client] Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });
      }
      
      return responseData;
    } catch (error) {
      // Debug logging
      if (typeof window !== 'undefined' && (window as any).__DEBUG_KYC__) {
        console.error('[KYC Client] Request failed:', error);
      }
      
      if (error instanceof Error) {
        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          // Check if it's a CORS error
          const isCorsError = error.message.includes('CORS') || 
                             (typeof window !== 'undefined' && !navigator.onLine === false);
          
          throw new Error(
            `Network request failed to ${url}\n\n` +
            `Possible causes:\n` +
            `1. API server not running at ${this.baseUrl}\n` +
            `2. CORS not configured on server (check browser console for CORS errors)\n` +
            `3. Network connectivity issue\n` +
            `4. Incorrect API URL\n\n` +
            `To fix CORS, add to your Django settings.py:\n` +
            `CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]\n\n` +
            `Original error: ${error.message}`
          );
        }
        throw error;
      }
      throw new Error(`Request failed: ${String(error)}`);
    }
  }

  /**
   * Create a new verification session
   */
  async createVerificationSession(
    params: CreateVerificationSessionParams
  ): Promise<VerificationSession> {
    const data: any = {
      country_code: params.country_code,
    };

    if (params.webhook_url) {
      data.webhook_url = params.webhook_url;
    }

    if (params.template_config) {
      data.template_config = params.template_config;
    }

    if (params.metadata) {
      data.metadata = params.metadata;
    }

    return this.makeRequest<VerificationSession>('POST', '/verifications/', data);
  }

  /**
   * Upload a document to a verification session
   */
  async uploadDocument(
    sessionId: string,
    file: File,
    purpose: string = 'id_document'
  ): Promise<Document> {
    return this.makeRequest<Document>(
      'POST',
      `/verifications/${sessionId}/documents/`,
      undefined,
      { file, purpose }
    );
  }

  /**
   * Get verification session status
   */
  async getVerificationSession(sessionId: string): Promise<VerificationSession> {
    return this.makeRequest<VerificationSession>('GET', `/verifications/${sessionId}/`);
  }

  /**
   * List all documents in a verification session
   */
  async listDocuments(sessionId: string): Promise<Document[]> {
    return this.makeRequest<Document[]>('GET', `/verifications/${sessionId}/documents/list/`);
  }

  /**
   * Get the KYC template URL for a session
   */
  async getTemplateUrl(sessionId: string): Promise<string> {
    const session = await this.getVerificationSession(sessionId);
    return session.kyc_template_url || '';
  }

  /**
   * Get the full template URL with API credentials as query parameters
   */
  async getTemplateUrlWithCredentials(sessionId: string): Promise<string> {
    const templateUrl = await this.getTemplateUrl(sessionId);
    
    if (!templateUrl) {
      throw new Error('Template URL not found for this session');
    }

    // Construct full URL
    let fullUrl: string;
    if (templateUrl.startsWith('/')) {
      // Relative URL - construct from base URL
      const baseWithoutApi = this.baseUrl.replace(/\/api\/v1\/?$/, '');
      fullUrl = `${baseWithoutApi}${templateUrl}`;
    } else if (templateUrl.startsWith('http')) {
      // Absolute URL
      fullUrl = templateUrl;
    } else {
      // Fallback
      const baseWithoutApi = this.baseUrl.replace(/\/api\/v1\/?$/, '');
      fullUrl = `${baseWithoutApi}/${templateUrl}`;
    }

    // Add query parameters
    const urlObj = new URL(fullUrl);
    urlObj.searchParams.set('api_key', this.apiKeyId);
    urlObj.searchParams.set('secret_key', this.secretKey);

    return urlObj.toString();
  }
}

