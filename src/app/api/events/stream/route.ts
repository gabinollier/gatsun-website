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

      request.signal.addEventListener('abort', () => {
        removeClient(controller);
        controller.close();
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
