import { NextRequest } from 'next/server';
import { addClient, removeClient, notifyClients, getClientCount } from '@/lib/sse';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addClient(controller);

      controller.enqueue(encoder.encode('data: connected\n\n'));

      notifyClients('viewers', { count: getClientCount() });

      // Heartbeat to detect dead connections
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
          removeClient(controller);
          try { controller.close(); } catch {}
          notifyClients('viewers', { count: getClientCount() });
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        removeClient(controller);
        try { controller.close(); } catch {}
        notifyClients('viewers', { count: getClientCount() });
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
