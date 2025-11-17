export interface SSEPayload {
  type: string;
  timestamp: number;
  count?: number;
}

type SSEGlobal = typeof globalThis & {
  __sseClients?: Set<ReadableStreamDefaultController>;
};

const globalForSSE = globalThis as SSEGlobal;

const clients = globalForSSE.__sseClients ?? new Set<ReadableStreamDefaultController>();

if (!globalForSSE.__sseClients) {
  globalForSSE.__sseClients = clients;
}

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export function notifyClients(message: string, extra?: Partial<Omit<SSEPayload, 'type' | 'timestamp'>>) {
  const encoder = new TextEncoder();
  const payload: SSEPayload = {
    type: message,
    timestamp: Date.now(),
    ...extra,
  };
  const data = encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

  clients.forEach((controller) => {
    try {
      controller.enqueue(data);
      console.log('SSE sent to client:', payload.type, 'timestamp:', payload.timestamp);
    } catch {
      clients.delete(controller);
    }
  });
}

export function getClientCount() {
  return clients.size;
}
