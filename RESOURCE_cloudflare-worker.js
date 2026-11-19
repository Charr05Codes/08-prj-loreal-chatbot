// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    };

    // Allow the deployed Worker, local previews, Codespaces, and GitHub Pages.
    // Reading the URL lets local previews use different ports.
    let isAllowedOrigin = false;

    if (requestOrigin) {
      try {
        const originUrl = new URL(requestOrigin);
        const hostname = originUrl.hostname;
        const isLocalhost =
          (hostname === 'localhost' || hostname === '127.0.0.1') &&
          (originUrl.protocol === 'http:' || originUrl.protocol === 'https:');
        const isCodespaces =
          hostname.endsWith('.app.github.dev') ||
          hostname.endsWith('.githubpreview.dev');

        isAllowedOrigin =
          requestOrigin === 'https://08-prj-loreal-chatbot-2.colin-harrison05.workers.dev' ||
          requestOrigin === 'https://charr05codes.github.io' ||
          isLocalhost ||
          isCodespaces;
      } catch (error) {
        isAllowedOrigin = false;
      }
    }

    if (isAllowedOrigin) {
      corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
      corsHeaders['Vary'] = 'Origin';
    }

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve the chatbot website from the same Worker deployment.
    if (request.method === 'GET') {
      return env.ASSETS.fetch(request);
    }

    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const userInput = await request.json();

    const requestBody = {
      model: 'gpt-4.1',
      messages: userInput.messages,
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders
    });
  }
};
