// Mia is paused in the public interface. Keep this endpoint closed as well.
export function GET() {
  return Response.json({ status: 'paused', error: 'O assistente está temporariamente indisponível.' }, {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export const POST = GET;
