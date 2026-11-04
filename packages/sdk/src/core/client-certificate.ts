import { BirdError } from "../errors.js";

/** File paths of a PEM certificate chain, leaf first, and its unencrypted PEM key. */
export interface ClientCertificateOptions {
  cert: string;
  key: string;
}

// A variable specifier keeps these modules out of the static import graph, so
// edge and browser bundlers never try to resolve them.
const load = (specifier: string): Promise<any> =>
  import(/* webpackIgnore: true */ /* @vite-ignore */ specifier);

/**
 * A certificate that cannot load. The request core rethrows it without a retry,
 * because a retry cannot fix configuration. index.ts does not export it, so
 * callers catch it as a BirdError.
 */
export class ClientCertificateError extends BirdError {}

/** Refuses what can be checked without reading the files. */
export function checkClientCertificate(
  options: ClientCertificateOptions,
  customFetch: unknown,
): void {
  if (!options.cert) {
    throw new BirdError(
      "`clientCertificate.key` needs its certificate: set `clientCertificate.cert`.",
    );
  }
  if (!options.key) {
    throw new BirdError(
      "`clientCertificate.cert` needs its key: set `clientCertificate.key`.",
    );
  }
  if (customFetch) {
    throw new BirdError(
      "`clientCertificate` cannot apply to a custom `fetch`; present the certificate from that fetch instead.",
    );
  }
  const runtime = globalThis as { process?: { versions?: { node?: string } } };
  if (typeof runtime.process?.versions?.node !== "string") {
    throw new BirdError("`clientCertificate` needs Node.js.");
  }
}

/**
 * A fetch that presents the certificate. The constructor cannot await, so the
 * files load on the first request; a load failure rejects every request.
 */
export function certificateFetch(
  options: ClientCertificateOptions,
): typeof fetch {
  let transport: Promise<Transport> | undefined;
  const certificateFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    transport ??= createTransport(options);
    const { fetch: undiciFetch, dispatcher } = await transport;
    // undici's fetch with its own Agent: Node's bundled fetch speaks another
    // undici version's handler API (Node 26 rejects an undici 6 Agent), and
    // undici's fetch rejects a global Request, so the Request is unpacked.
    const request = input instanceof Request ? input : undefined;
    const res = await undiciFetch(request ? request.url : input, {
      ...(request && {
        method: request.method,
        headers: [...request.headers],
        // Buffered, not streamed: a stream goes out chunked, with no
        // Content-Length, which some proxies refuse on a POST.
        body: request.body ? await request.arrayBuffer() : null,
        signal: request.signal,
        redirect: request.redirect,
      }),
      ...init,
      dispatcher,
    });
    // Callers read a global Response, not undici's own class.
    return new Response(res.body as BodyInit | null, {
      status: res.status,
      statusText: res.statusText,
      headers: [...res.headers],
    });
  };
  return certificateFetch as typeof fetch;
}

interface Transport {
  fetch: (
    input: unknown,
    init: Record<string, unknown>,
  ) => Promise<{
    body: unknown;
    status: number;
    statusText: string;
    headers: Iterable<[string, string]>;
  }>;
  dispatcher: unknown;
}

async function createTransport({
  cert: certPath,
  key: keyPath,
}: ClientCertificateOptions): Promise<Transport> {
  const [{ readFile }, { createPrivateKey, X509Certificate }] =
    await Promise.all([load("node:fs/promises"), load("node:crypto")]);
  let Agent: new (options: object) => unknown;
  let undiciFetch: Transport["fetch"];
  try {
    ({ Agent, fetch: undiciFetch } = await load("undici"));
  } catch {
    throw new ClientCertificateError(
      "`clientCertificate` needs the optional `undici` dependency: install undici@6.",
    );
  }
  const read = async (path: string): Promise<string> => {
    try {
      return await readFile(path, "utf8");
    } catch (err) {
      throw new ClientCertificateError(
        `Read client certificate file ${path}: ${(err as Error).message}`,
      );
    }
  };
  const [cert, key] = await Promise.all([read(certPath), read(keyPath)]);
  let leaf: { checkPrivateKey(key: unknown): boolean };
  try {
    leaf = new X509Certificate(cert);
  } catch (err) {
    throw new ClientCertificateError(
      `Client certificate ${certPath}: ${(err as Error).message}`,
    );
  }
  let privateKey: unknown;
  try {
    privateKey = createPrivateKey(key);
  } catch (err) {
    throw new ClientCertificateError(
      `Client key ${keyPath}: ${(err as Error).message}. Pass an unencrypted PEM key.`,
    );
  }
  if (!leaf.checkPrivateKey(privateKey)) {
    throw new ClientCertificateError(
      `Client key ${keyPath} does not match the certificate ${certPath}.`,
    );
  }
  return {
    fetch: undiciFetch,
    dispatcher: new Agent({ connect: { cert, key } }),
  };
}
