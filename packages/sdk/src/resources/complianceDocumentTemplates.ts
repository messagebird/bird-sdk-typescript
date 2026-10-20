// `bird.complianceDocumentTemplates` — the blank forms registration
// requirements name in their `template_url`. Hand-written whole: its only
// operation returns raw bytes.

import { getComplianceDocumentTemplate } from "../generated/sdk.gen.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import { Resource } from "./base.js";
import { complianceFileOutcome, type ComplianceFile } from "./complianceFile.js";

export class ComplianceDocumentTemplatesResource extends Resource {
  /**
   * Download the blank form a requirement's `template_url` names, as a PDF,
   * Word document, JPEG or PNG. Complete it and upload the result with
   * `bird.complianceAttachments.create`; export a Word form to PDF first.
   *
   * @example
   * const form = await bird.complianceDocumentTemplates.get("cmt_01krdgeqcxet5s7t44vh8rt9mg");
   * // Complete the form, then upload it with bird.complianceAttachments.create.
   * console.log(form.filename, form.contentType);
   */
  get(templateId: string, options?: RequestOptions): APIPromise<ComplianceFile> {
    return this.call<ComplianceFile>("GET", options, async ({ signal, headers }) =>
      complianceFileOutcome(
        await getComplianceDocumentTemplate({
          client: this.client,
          path: { template_id: templateId },
          headers,
          signal,
          parseAs: "arrayBuffer",
        }),
      ));
  }
}
