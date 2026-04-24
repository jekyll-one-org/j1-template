// -----------------------------------------------------------------------------
// netlify/functions/claude-proxy.mjs
// claude - J1 claudeAI modifications #2
//
// Server-side proxy for Anthropic's Messages API. Holds CLAUDE_API_KEY in
// the Netlify Function runtime so the key is NEVER shipped to the browser
// and NEVER baked into the generated static site.
//
// Configure CLAUDE_API_KEY in:
//   * Netlify UI : Site settings > Environment variables
//                  Scope: "Functions" only (do NOT scope to Builds).
//   * Local dev  : a `.env` file in the site root; `netlify dev` will load it.
//
// Optional environment variables:
//   ALLOWED_ORIGINS   comma-separated list of origins allowed to call the
//                     proxy, e.g. "https://example.com,http://localhost:4000"
//                     If unset the proxy accepts any origin (dev-friendly).
//   ANTHROPIC_VERSION value of the "anthropic-version" header.
//                     Defaults to "2023-06-01".
// -----------------------------------------------------------------------------

const ANTHROPIC_ENDPOINT        = 'https://api.anthropic.com/v1/messages';
const DEFAULT_ANTHROPIC_VERSION = '2023-06-01';

export default async (request) => {

  // Pre-flight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405, request);
  }

  if (!originAllowed(request)) {
    return jsonResponse({ error: 'Forbidden origin' }, 403, request);
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      { error: 'Server misconfigured: CLAUDE_API_KEY is not set' },
      500, request
    );
  }

  // Read and forward the body as-is. The client is responsible for sending
  // a valid Anthropic Messages API payload (model, messages, max_tokens ...).
  let payload;
  try {
    payload = await request.json();
  } catch (_err) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, request);
  }

  try {
    const upstream = await fetch(ANTHROPIC_ENDPOINT, {
      method:  'POST',
      headers: {
        'content-type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': process.env.ANTHROPIC_VERSION
                               || DEFAULT_ANTHROPIC_VERSION
      },
      body: JSON.stringify(payload)
    });

    // Pipe the body through so that streaming (SSE) responses still work
    // when the client sets "stream": true in the payload.
    return new Response(upstream.body, {
      status:  upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type')
                          || 'application/json',
        ...corsHeaders(request)
      }
    });
  } catch (err) {
    return jsonResponse(
      { error: 'Upstream request failed', detail: String(err) },
      502, request
    );
  }
};

// Netlify Functions v2 routing: expose the function at /api/claude.
export const config = { path: '/api/claude' };

// ---------- helpers ---------------------------------------------------------

function allowList() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);
}

function originAllowed(request) {
  const list = allowList();
  if (list.length === 0) return true;              // permissive if unset
  return list.includes(request.headers.get('origin') || '');
}

function corsHeaders(request) {
  const list   = allowList();
  const origin = request.headers.get('origin') || '';
  const allow  = list.length === 0 || list.includes(origin)
                   ? (origin || '*')
                   : '';
  return {
    'access-control-allow-origin':  allow,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary':                         'Origin'
  };
}

function jsonResponse(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(request)
    }
  });
}
