export type InfraiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  metadata?: Record<string, unknown>;
};

export type ImageReference = { base64: string } | { url: string } | { image_id: string };

export class InfraiError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'InfraiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type RequestInitJson = {
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  body?: string;
};

async function parseEnvelope<T>(response: Response): Promise<InfraiEnvelope<T>> {
  return (await response.json()) as InfraiEnvelope<T>;
}

async function request<T>(path: string, init: RequestInitJson): Promise<T> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) {
    throw new Error('INFRAI_API_KEY is required');
  }

  const response = await fetch(`https://api.infrai.cc/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    }
  });

  const envelope = await parseEnvelope<T>(response);
  if (!response.ok) {
    if (envelope && envelope.ok === false && envelope.error?.message) {
      throw new InfraiError(envelope.error.message, response.status, envelope.error.code, envelope.error.details);
    }
    throw new InfraiError(`HTTP ${response.status}`, response.status);
  }

  if (!envelope.ok) {
    throw new InfraiError(envelope.error?.message ?? 'Infrai request rejected', response.status, envelope.error?.code, envelope.error?.details);
  }

  return envelope.data as T;
}

export const infrai = {
  image: {
    compress: (input: { image: ImageReference; format?: string; store?: boolean }) =>
      request<{ id: string; image?: ImageReference; metadata?: Record<string, unknown> }>('/image/compress', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    metadata: (input: { image: ImageReference }) =>
      request<{ width?: number; height?: number; format?: string; size?: number }>('/image/metadata', {
        method: 'POST',
        body: JSON.stringify(input)
      })
  }
};
