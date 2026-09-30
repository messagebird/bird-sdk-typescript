export function recordFetch(route: (request: Request) => Response | Promise<Response>) {
  const calls: Request[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    calls.push(request);
    return route(request);
  }) as typeof fetch;
  return { fn, calls };
}

export function scriptedFetch(responses: Array<() => Response>) {
  let next = 0;
  return recordFetch(() => responses[Math.min(next++, responses.length - 1)]());
}

export function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function optionalJsonResponse(status: number, body?: unknown): Response {
  return body === undefined ? new Response(null, { status }) : jsonResponse(status, body);
}
