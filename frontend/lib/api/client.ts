import { getApiBaseUrl } from './config';

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  tenantGroupId?: string;
  actorUserId?: string;
  actorMemberId?: string;
  idempotencyKey?: string;
  raw?: boolean;
}

function buildHeaders(init: HeadersInit, config: ApiRequestConfig): Headers {
  const headers = new Headers(init);
  if (config.headers) Object.entries(config.headers).forEach(([k, v]) => headers.set(k, v));
  if (config.tenantGroupId) headers.set('X-Tenant-Group-Id', config.tenantGroupId);
  if (config.actorUserId) headers.set('X-Actor-User-Id', config.actorUserId);
  if (config.actorMemberId) headers.set('X-Actor-Member-Id', config.actorMemberId);
  if (config.idempotencyKey) headers.set('Idempotency-Key', config.idempotencyKey);
  return headers;
}

function resolveUrl(base: string, path: string): string {
  if (path.startsWith('http')) return path;
  const baseClean = base.replace(/\/$/, '');
  const pathClean = path.replace(/^\//, '');
  return baseClean + '/' + pathClean;
}

export function createApiClient(opts: { baseUrl?: string } = {}) {
  const baseUrl = opts.baseUrl ?? getApiBaseUrl();

  async function request<T>(method: string, path: string, config: ApiRequestConfig = {}, body?: unknown): Promise<T> {
    const url = resolveUrl(baseUrl, path);
    const headers = buildHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }, config);
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined && !config.raw ? JSON.stringify(body) : (body as BodyInit | undefined),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const err = new Error((errBody as { message?: string })?.message ?? res.statusText) as Error & {
        status?: number;
        code?: string;
        details?: unknown;
        response?: Response;
      };
      err.status = res.status;
      err.code = (errBody as { code?: string })?.code;
      err.details = (errBody as Record<string, unknown>)?.details ?? errBody;
      err.response = res;
      throw err;
    }
    if (config.raw) return res as unknown as T;
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  return {
    get<T>(path: string, config?: ApiRequestConfig) {
      return request<T>('GET', path, config);
    },
    post<T>(path: string, body?: unknown, config?: ApiRequestConfig) {
      return request<T>('POST', path, config ?? {}, body);
    },
    put<T>(path: string, body?: unknown, config?: ApiRequestConfig) {
      return request<T>('PUT', path, config ?? {}, body);
    },
    patch<T>(path: string, body?: unknown, config?: ApiRequestConfig) {
      return request<T>('PATCH', path, config ?? {}, body);
    },
    delete<T>(path: string, config?: ApiRequestConfig) {
      return request<T>('DELETE', path, config);
    },
  };
}

export const apiClient = createApiClient();
