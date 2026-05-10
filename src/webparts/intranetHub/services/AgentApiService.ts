import { AadHttpClient, AadHttpClientFactory } from '@microsoft/sp-http';
import { IApiResponse, IApiError, IChatHistoryItem } from '../models/IAgentModels';

export interface ISharePointContext {
  site: { id: string; url: string; name?: string };
  page: { id?: string; url: string; title?: string };
}

// Use the backend API's client ID as the token audience
export class AgentApiService {
  private backendUrl: string;
  private backendClientId: string;
  private aadHttpClientFactory: AadHttpClientFactory | undefined;
  private aadClient?: AadHttpClient;

  constructor(backendUrl: string, backendClientId: string, aadHttpClientFactory?: AadHttpClientFactory) {
    this.backendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    this.backendClientId = backendClientId;
    this.aadHttpClientFactory = aadHttpClientFactory;
  }

  private async getClient(): Promise<AadHttpClient | undefined> {
    if (this.aadClient) return this.aadClient;
    if (this.aadHttpClientFactory) {
      try {
        this.aadClient = await this.aadHttpClientFactory.getClient(this.backendClientId);
        return this.aadClient;
      } catch (err) {
        console.warn('[AgentApiService] Failed to initialize AadHttpClient', err);
      }
    }
    return undefined;
  }

  private handleError(error: unknown): never {
    console.error('[AgentApiService] Error:', error);
    if (error instanceof Error) throw error;
    if (typeof error === 'string') throw new Error(error);
    if (error && typeof error === 'object') {
      const maybeMsg = (error as any).message || (error as any).detail || JSON.stringify(error);
      throw new Error(maybeMsg);
    }
    throw new Error('An unknown error occurred');
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, baseDelayMs = 500): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Don't retry on 400 or 401 client errors, if we can detect them
        if (error instanceof Error && (error.message.includes('HTTP 400') || error.message.includes('HTTP 401'))) {
          throw error;
        }
        
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[AgentApiService] Operation failed. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private async parseHttpError(response: Response): Promise<string> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData: IApiError = await response.json();
      if (errorData.detail && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData.detail && typeof errorData.detail === 'object' && 'error' in errorData.detail) {
        const err = errorData.detail.error;
        errorMessage = `[${err.code}] ${err.message}`;
        if (err.recovery_hint) errorMessage += `\nHint: ${err.recovery_hint}`;
      } else if (errorData.detail) {
        errorMessage = JSON.stringify(errorData.detail);
      }
    } catch {
      // fallback to default
    }
    return errorMessage;
  }

  public async sendMessage(
    message: string,
    history?: IChatHistoryItem[],
    sessionId?: string,
    pendingFileId?: string,
    context?: ISharePointContext
  ): Promise<IApiResponse> {
    try {
      const endpoint = `${this.backendUrl}/api/v1/chat/`;
      const requestBody = {
        message,
        ...(history && history.length > 0 && { history }),
        ...(sessionId && { session_id: sessionId }),
        ...(pendingFileId && { pending_file_id: pendingFileId }),
        ...(context && { context }),
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const client = await this.getClient();
      let response: Response;
      
      response = await this.withRetry(async () => {
        if (client) {
          return await client.post(
            endpoint,
            AadHttpClient.configurations.v1,
            { headers, body: JSON.stringify(requestBody) }
          ) as unknown as Response;
        } else {
          // Local dev: plain fetch (no auth — backend must be running without auth)
          return await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(requestBody) });
        }
      });

      if (!response.ok) {
        const msg = await this.parseHttpError(response);
        throw new Error(msg);
      }

      return await response.json() as IApiResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async sendMessageWithFiles(
    message: string,
    files: Array<{ file: File; name: string }>,
    history?: IChatHistoryItem[],
    sessionId?: string,
    pendingFileId?: string,
    context?: ISharePointContext
  ): Promise<IApiResponse> {
    try {
      const endpoint = `${this.backendUrl}/api/v1/chat/upload`;
      const formData = new FormData();

      for (const f of files) {
        formData.append('files', f.file, f.name);
      }
      if (message) formData.append('message', message);
      if (history && history.length > 0) formData.append('history', JSON.stringify(history));
      if (sessionId) formData.append('session_id', sessionId);
      if (pendingFileId) formData.append('pending_file_id', pendingFileId);
      if (context) formData.append('context', JSON.stringify(context));

      // Do NOT set Content-Type — browser sets it with the multipart boundary
      const headers: HeadersInit = { 'Accept': 'application/json' };

      const client = await this.getClient();
      let response: Response;
      
      response = await this.withRetry(async () => {
        if (client) {
          return await client.post(
            endpoint,
            AadHttpClient.configurations.v1,
            { headers, body: formData }
          ) as unknown as Response;
        } else {
          return await fetch(endpoint, { method: 'POST', headers, body: formData });
        }
      });

      if (!response.ok) {
        const msg = await this.parseHttpError(response);
        throw new Error(msg);
      }

      return await response.json() as IApiResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const endpoint = `${this.backendUrl}/health`;
      const response = await fetch(endpoint, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }
}
