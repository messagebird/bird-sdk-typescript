import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";
import { BirdNotFoundError } from "../../src/errors.js";
import { jsonResponse, recordFetch, scriptedFetch } from "../transport.js";

const PDF = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n");
const ATTACHMENT = {
  id: "tca_01krdgeqcxet5s7t44vh8rt9mg",
  filename: "proof.pdf",
  content_type: "application/pdf",
  size_bytes: PDF.length,
  download_url: "https://files.example/proof.pdf",
  download_url_expires_at: "2026-10-08T00:00:00Z",
  status: "draft",
  expires_at: null,
  created_at: "2026-10-07T00:00:00Z",
  updated_at: "2026-10-07T00:00:00Z",
};

function client(fn: typeof fetch, maxRetries = 0) {
  return new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, maxRetries });
}

async function formOf(request: Request): Promise<FormData> {
  return request.clone().formData();
}

describe("bird.complianceAttachments.create", () => {
  it("sends the file and description as multipart parts", async () => {
    const { fn, calls } = recordFetch(() => jsonResponse(201, ATTACHMENT));
    const attachment = await client(fn).complianceAttachments.create({
      file: new Blob([PDF]),
      filename: "proof.pdf",
      description: "Utility bill",
    });

    expect(calls[0].method).toBe("POST");
    expect(new URL(calls[0].url).pathname).toBe("/v1/compliance/attachments");
    expect(calls[0].headers.get("content-type")).toMatch(/^multipart\/form-data; boundary=/);
    expect(calls[0].headers.get("idempotency-key")).toBeTruthy();
    const form = await formOf(calls[0]);
    const file = form.get("file") as File;
    expect(file.name).toBe("proof.pdf");
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(PDF);
    expect(form.get("description")).toBe("Utility bill");
    expect(attachment.id).toBe(ATTACHMENT.id);
  });

  it("omits an unset description and keeps a File's own name", async () => {
    const { fn, calls } = recordFetch(() => jsonResponse(200, ATTACHMENT));
    await client(fn).complianceAttachments.create({ file: new File([PDF], "scan.pdf") });

    const form = await formOf(calls[0]);
    expect((form.get("file") as File).name).toBe("scan.pdf");
    expect(form.has("description")).toBe(false);
  });

  it("refuses a Blob with no filename before sending", () => {
    const { fn, calls } = recordFetch(() => jsonResponse(201, ATTACHMENT));
    const params = { file: new Blob([PDF]) } as unknown as Parameters<BirdClient["complianceAttachments"]["create"]>[0];
    expect(() => client(fn).complianceAttachments.create(params)).toThrow(TypeError);
    expect(calls).toHaveLength(0);
  });

  // The server dedupes a retried upload by its key; a fresh key per attempt
  // would turn an ambiguous failure into a second write.
  it("retries with the same idempotency key and the same file", async () => {
    const { fn, calls } = scriptedFetch([
      () => jsonResponse(503, { error: { type: "service_unavailable_error", code: "E00503", message: "try again" } }),
      () => jsonResponse(201, ATTACHMENT),
    ]);
    await client(fn, 1).complianceAttachments.create({ file: new Blob([PDF]), filename: "proof.pdf" });

    expect(calls).toHaveLength(2);
    expect(calls[1].headers.get("idempotency-key")).toBe(calls[0].headers.get("idempotency-key"));
    const retried = (await formOf(calls[1])).get("file") as File;
    expect(new Uint8Array(await retried.arrayBuffer())).toEqual(PDF);
  });
});

describe("compliance byte reads", () => {
  it("returns an attachment's bytes, type and RFC 5987 filename", async () => {
    const { fn, calls } = recordFetch(
      () =>
        new Response(PDF, {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="_rbol.pdf"; filename*=UTF-8''%C3%A1rbol.pdf`,
          },
        }),
    );
    const file = await client(fn).complianceAttachments.get("tca_01krdgeqcxet5s7t44vh8rt9mg");

    expect(new URL(calls[0].url).pathname).toBe("/v1/compliance/attachments/tca_01krdgeqcxet5s7t44vh8rt9mg");
    expect(file.data).toEqual(PDF);
    expect(file.contentType).toBe("application/pdf");
    expect(file.filename).toBe("árbol.pdf");
  });

  it("reads a blank Word form with its declared type", async () => {
    const docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const { fn, calls } = recordFetch(
      () =>
        new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
          status: 200,
          headers: { "content-type": docx, "content-disposition": `attachment; filename="form.docx"` },
        }),
    );
    const form = await client(fn).complianceDocumentTemplates.get("cmt_01krdgeqcxet5s7t44vh8rt9mg");

    expect(new URL(calls[0].url).pathname).toBe("/v1/compliance/document-templates/cmt_01krdgeqcxet5s7t44vh8rt9mg");
    expect(form.contentType).toBe(docx);
    expect(form.filename).toBe("form.docx");
    expect(Array.from(form.data)).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });

  it("maps a 404 to the API error", async () => {
    const { fn } = recordFetch(() =>
      jsonResponse(404, { error: { type: "not_found_error", code: "E12044", message: "attachment not found" } }),
    );
    await expect(client(fn).complianceAttachments.get("tca_01krdgeqcxet5s7t44vh8rt9mg")).rejects.toBeInstanceOf(
      BirdNotFoundError,
    );
  });
});
