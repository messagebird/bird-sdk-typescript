// `bird.complianceAttachments` — the documents uploaded for registrations. List
// and delete are generated; the upload and the byte read are written here
// because one sends a multipart body and the other returns raw bytes.

import { createComplianceAttachment, getComplianceAttachment } from "../generated/sdk.gen.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import {
  ComplianceAttachmentsResourceBase,
  type Attachment,
  type ComplianceAttachmentsListQuery,
} from "./complianceAttachments.gen.js";
import { complianceFileOutcome, type ComplianceFile } from "./complianceFile.js";

export type { Attachment, ComplianceAttachmentsListQuery, ComplianceFile };
export type ComplianceAttachment = Attachment;

/**
 * One document to upload: a `File`, which carries its own name, or a `Blob`
 * with the `filename` the attachment is listed under.
 */
export type ComplianceAttachmentsCreateParams =
  | {
      /** The file. PNG, JPEG, or PDF, up to 10 MB; the contents determine the type. */
      file: File;
      /** Lists the attachment under this name instead of `file.name`. */
      filename?: string;
      /** A short note describing what the file shows. */
      description?: string;
    }
  | {
      /** The file's bytes. PNG, JPEG, or PDF, up to 10 MB; the contents determine the type. */
      file: Blob;
      /** The name the attachment is listed under. */
      filename: string;
      /** A short note describing what the file shows. */
      description?: string;
    };

export class ComplianceAttachmentsResource extends ComplianceAttachmentsResourceBase {
  /**
   * Upload a supporting document for a registration and get back the
   * attachment to cite by id in a submission's answers. PNG, JPEG, and PDF
   * files up to 10 MB are accepted; the contents determine the type.
   *
   * Uploading bytes identical to an existing attachment returns that
   * attachment instead of a second one, so retrying an upload whose outcome is
   * unknown is safe. An attachment no registration cites expires after seven
   * days.
   *
   * @example
   * import { readFile } from "node:fs/promises";
   *
   * const attachment = await bird.complianceAttachments.create({
   *   file: new Blob([await readFile("proof-of-address.pdf")]),
   *   filename: "proof-of-address.pdf",
   *   description: "Utility bill for the registered address",
   * });
   * // Cite this id as the answer's attachment_id in a submission.
   * console.log(attachment.id, attachment.content_type);
   */
  create(params: ComplianceAttachmentsCreateParams, options?: RequestOptions): APIPromise<ComplianceAttachment> {
    if (params.filename === undefined && !(params.file instanceof File)) {
      throw new TypeError("complianceAttachments.create needs `filename` when `file` is a Blob rather than a File");
    }
    const file = params.filename === undefined ? params.file : new File([params.file], params.filename, { type: params.file.type });
    return this.call<ComplianceAttachment>("POST", options, ({ signal, headers }) =>
      createComplianceAttachment({
        client: this.client,
        body: { file, ...(params.description === undefined ? {} : { description: params.description }) },
        headers,
        signal,
      }));
  }

  /**
   * Download the bytes of an uploaded registration attachment, with the
   * content type and filename it was stored under.
   *
   * @example
   * const file = await bird.complianceAttachments.get("tca_01krdgeqcxet5s7t44vh8rt9mg");
   * console.log(file.filename, file.contentType, file.data.length);
   */
  get(attachmentId: string, options?: RequestOptions): APIPromise<ComplianceFile> {
    return this.call<ComplianceFile>("GET", options, async ({ signal, headers }) =>
      complianceFileOutcome(
        await getComplianceAttachment({
          client: this.client,
          path: { attachment_id: attachmentId },
          headers,
          signal,
          parseAs: "arrayBuffer",
        }),
      ));
  }
}
