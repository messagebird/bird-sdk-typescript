import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:https";
import type { TLSSocket } from "node:tls";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  BirdClient,
  BirdConnectionError,
  BirdError,
  BirdTimeoutError,
} from "../src/index.js";
import { certificateFetch } from "../src/core/client-certificate.js";

// The SDK verifies servers against Node's roots, so the test Agent also trusts
// the throwaway CA. Everything else about the Agent is what the SDK built.
// `respond` short-circuits undici's fetch for the host test, which has no server.
const trust = vi.hoisted(() => ({
  ca: "",
  urls: [] as string[],
  respond: undefined as (() => Response) | undefined,
}));
vi.mock("undici", async (importOriginal) => {
  const undici = await importOriginal<typeof import("undici")>();
  class Agent extends undici.Agent {
    constructor(options: ConstructorParameters<typeof undici.Agent>[0]) {
      super({ ...options, connect: { ...options?.connect, ca: trust.ca } });
    }
  }
  const fetch = (...args: Parameters<typeof undici.fetch>) => {
    trust.urls.push(String(args[0]));
    return trust.respond ? trust.respond() : undici.fetch(...args);
  };
  return { ...undici, Agent, fetch };
});

const dir = mkdtempSync(join(tmpdir(), "bird-sdk-mtls-"));
const file = (name: string) => join(dir, name);

function openssl(...args: string[]) {
  execFileSync("openssl", args, { cwd: dir, stdio: "pipe" });
}

beforeAll(() => {
  const ec = [
    "-newkey",
    "ec",
    "-pkeyopt",
    "ec_paramgen_curve:prime256v1",
    "-nodes",
  ];
  writeFileSync(
    file("ca.ext"),
    "basicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign\nsubjectKeyIdentifier=hash\n",
  );
  openssl(
    "req",
    ...ec,
    "-keyout",
    "ca.key",
    "-out",
    "ca.csr",
    "-subj",
    "/CN=test CA",
  );
  openssl(
    "x509",
    "-req",
    "-in",
    "ca.csr",
    "-signkey",
    "ca.key",
    "-out",
    "ca.pem",
    "-days",
    "1",
    "-extfile",
    "ca.ext",
  );
  for (const [name, usage] of [
    ["server", "serverAuth"],
    ["client", "clientAuth"],
  ]) {
    writeFileSync(
      file(`${name}.ext`),
      `basicConstraints=CA:FALSE\nauthorityKeyIdentifier=keyid\nsubjectAltName=IP:127.0.0.1\nextendedKeyUsage=${usage}\n`,
    );
    openssl(
      "req",
      ...ec,
      "-keyout",
      `${name}.key`,
      "-out",
      `${name}.csr`,
      "-subj",
      `/CN=sdk ${name}`,
    );
    openssl(
      "x509",
      "-req",
      "-in",
      `${name}.csr`,
      "-CA",
      "ca.pem",
      "-CAkey",
      "ca.key",
      "-CAcreateserial",
      "-out",
      `${name}.pem`,
      "-days",
      "1",
      "-extfile",
      `${name}.ext`,
    );
  }
  openssl(
    "genpkey",
    "-algorithm",
    "EC",
    "-pkeyopt",
    "ec_paramgen_curve:prime256v1",
    "-out",
    "other.key",
  );
  openssl(
    "pkcs8",
    "-topk8",
    "-in",
    "client.key",
    "-out",
    "encrypted.key",
    "-passout",
    "pass:secret",
  );
  trust.ca = readFileSync(file("ca.pem"), "utf8");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const certificate = () => ({
  cert: file("client.pem"),
  key: file("client.key"),
});

describe("clientCertificate", () => {
  let server: Server;
  let url: string;
  const seen: {
    cn: string;
    method?: string;
    body: string;
    length?: string;
    encoding?: string;
  }[] = [];

  beforeAll(async () => {
    server = createServer(
      {
        cert: readFileSync(file("server.pem")),
        key: readFileSync(file("server.key")),
        ca: readFileSync(file("ca.pem")),
        requestCert: true,
        rejectUnauthorized: true,
      },
      (req, res) => {
        if (req.url === "/v1/hang") return;
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          seen.push({
            cn: (req.socket as TLSSocket).getPeerCertificate().subject.CN,
            method: req.method,
            body,
            length: req.headers["content-length"],
            encoding: req.headers["transfer-encoding"],
          });
          res.setHeader("Content-Type", "application/json");
          res.end('{"ok":true}');
        });
      },
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    url = `https://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
  });

  it("presents the certificate on the handshake", async () => {
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      baseUrl: url,
      clientCertificate: certificate(),
    });
    const got = await bird.request({ method: "GET", path: "/v1/workspace" });
    expect(got).toEqual({ ok: true });
    const posted = await bird.request({
      method: "POST",
      path: "/v1/workspace",
      body: { name: "acme" },
    });
    expect(posted).toEqual({ ok: true });
    expect(seen).toEqual([
      {
        cn: "sdk client",
        method: "GET",
        body: "",
        length: undefined,
        encoding: undefined,
      },
      // A sized body, as on the default path: some proxies refuse a chunked POST.
      {
        cn: "sdk client",
        method: "POST",
        body: '{"name":"acme"}',
        length: "15",
        encoding: undefined,
      },
    ]);
  });

  it("aborts a request at the per-attempt timeout", async () => {
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      baseUrl: url,
      clientCertificate: certificate(),
      timeout: 200,
      maxRetries: 0,
    });
    await expect(
      bird.request({ method: "GET", path: "/v1/hang" }),
    ).rejects.toBeInstanceOf(BirdTimeoutError);
  });

  it("sends a multipart body passed as init", async () => {
    seen.length = 0;
    const form = new FormData();
    form.set("description", "proof");
    const res = await certificateFetch(certificate())(`${url}/v1/upload`, {
      method: "POST",
      body: form,
    });
    expect(res).toBeInstanceOf(Response);
    expect(seen[0].body).toContain('name="description"');
    expect(seen[0].body).toContain("proof");
  });

  it("sends a multipart Request with its length", async () => {
    seen.length = 0;
    const form = new FormData();
    form.set("description", "proof");
    await certificateFetch(certificate())(
      new Request(`${url}/v1/upload`, { method: "POST", body: form }),
    );
    expect(seen[0].body).toContain("proof");
    expect(Number(seen[0].length)).toBe(seen[0].body.length);
    expect(seen[0].encoding).toBeUndefined();
  });

  it("selects the region's mTLS host and keeps an explicit base URL", async () => {
    trust.urls.length = 0;
    trust.respond = () =>
      new Response("{}", { headers: { "Content-Type": "application/json" } });
    try {
      await new BirdClient({
        apiKey: "bk_us1_x",
        clientCertificate: certificate(),
      }).request({ method: "GET", path: "/v1/workspace" });
      await new BirdClient({
        apiKey: "bk_us1_x",
        baseUrl: "https://custom.example.com",
        clientCertificate: certificate(),
      }).request({ method: "GET", path: "/v1/workspace" });
    } finally {
      trust.respond = undefined;
    }
    expect(trust.urls).toEqual([
      "https://mtls.us1.platform.bird.com/v1/workspace",
      "https://custom.example.com/v1/workspace",
    ]);
  });

  it.each([
    [
      "key without certificate",
      { cert: "", key: file("client.key") },
      "certificate",
    ],
    ["certificate without key", { cert: file("client.pem"), key: "" }, "key"],
  ])("refuses a %s at construction", (_, clientCertificate, named) => {
    expect(
      () => new BirdClient({ apiKey: "bk_eu1_x", clientCertificate }),
    ).toThrow(
      expect.objectContaining({
        name: "BirdError",
        message: expect.stringContaining(named),
      }),
    );
  });

  it("refuses a custom fetch at construction", () => {
    expect(
      () =>
        new BirdClient({
          apiKey: "bk_eu1_x",
          fetch,
          clientCertificate: certificate(),
        }),
    ).toThrow(/fetch/);
  });

  it("refuses a runtime other than Node at construction", () => {
    vi.stubGlobal("process", undefined);
    expect(
      () =>
        new BirdClient({
          apiKey: "bk_eu1_x",
          clientCertificate: certificate(),
        }),
    ).toThrow(/Node/);
  });

  it.each([
    [
      "missing file",
      { cert: file("missing.pem"), key: file("client.key") },
      file("missing.pem"),
    ],
    [
      "mismatched key",
      { cert: file("client.pem"), key: file("other.key") },
      file("other.key"),
    ],
    [
      "encrypted key",
      { cert: file("client.pem"), key: file("encrypted.key") },
      file("encrypted.key"),
    ],
  ])(
    "rejects every request for a %s, without retrying",
    async (_, clientCertificate, named) => {
      const bird = new BirdClient({
        apiKey: "bk_eu1_x",
        baseUrl: url,
        clientCertificate,
      });
      for (let i = 0; i < 2; i++) {
        const err = await bird
          .request({ method: "GET", path: "/v1/workspace" })
          .catch((e: unknown) => e);
        expect(err).toBeInstanceOf(BirdError);
        expect(err).not.toBeInstanceOf(BirdConnectionError);
        expect((err as Error).message).toContain(named);
      }
    },
  );
});

describe("edge bundle", () => {
  it("keeps undici and Node built-ins out of the static import graph", async () => {
    const { build } = await import("tsdown");
    const outDir = mkdtempSync(join(tmpdir(), "bird-sdk-edge-"));
    await build({
      config: false,
      entry: ["src/index.ts"],
      format: ["esm"],
      outDir,
      dts: false,
      logLevel: "silent",
      define: { __SDK_VERSION__: JSON.stringify("0.0.0") },
    });
    const out = readdirSync(outDir)
      .filter((f) => f.endsWith(".mjs"))
      .map((f) => readFileSync(join(outDir, f), "utf8"))
      .join("\n")
      // TSDoc examples in the bundle import node: modules as sample code.
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(out).not.toMatch(/from\s*["'](undici|node:[^"']+)["']/);
    expect(out).not.toMatch(/import\(\s*["'](undici|node:[^"']+)["']\s*\)/);
  }, 60_000);
});
