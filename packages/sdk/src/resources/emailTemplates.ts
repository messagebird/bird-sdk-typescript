// `bird.email.templates` — the generated template facade plus its nested
// versions and broadcasts collections, which a generated class can't declare,
// and a hand-written `create`: its body nests the draft's initial content
// under a language-tag map the facade generator drops.

import { createEmailTemplate } from "../generated/sdk.gen.js";
import type { EmailTemplate, EmailTemplateCreate } from "../generated/types.gen.js";
import { Resource } from "./base.js";
import { EmailTemplatesResourceBase } from "./emailTemplates.gen.js";
import { EmailTemplatesBroadcastsResource } from "./emailTemplatesBroadcasts.gen.js";
import { EmailTemplatesVersionsResource } from "./emailTemplatesVersions.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/** Body for `bird.email.templates.create`. Wire data is snake_case verbatim. */
export type EmailTemplatesCreateParams = EmailTemplateCreate;

export class EmailTemplatesResource extends EmailTemplatesResourceBase {
  /** Drafts and published versions — `bird.email.templates.versions.list(...)`, `.submit(...)`, … */
  readonly versions: EmailTemplatesVersionsResource;

  /** The broadcasts blocking a template delete — `bird.email.templates.broadcasts.list(...)` */
  readonly broadcasts: EmailTemplatesBroadcastsResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.versions = new EmailTemplatesVersionsResource(...args);
    this.broadcasts = new EmailTemplatesBroadcastsResource(...args);
  }

  /**
   * Create a template and its first editable draft, optionally with
   * per-language content under `languages`. The display name defaults to
   * `slug`, and a slug already used in the workspace is refused with a `409`.
   * Submit the draft before sending it.
   *
   * @example Create a template with its first language
   * const template = await bird.email.templates.create({
   *   slug: "welcome-email",
   *   category: "marketing",
   *   source: "html",
   *   languages: {
   *     en: { subject: "Welcome, {{ first_name }}", html: "<p>Hi</p>" },
   *   },
   * });
   * console.log(template.id, template.draft_version_id);
   */
  create(
    params: EmailTemplatesCreateParams,
    options?: RequestOptions,
  ): APIPromise<EmailTemplate> {
    return this.call<EmailTemplate>("POST", options, ({ signal, headers }) =>
      createEmailTemplate({ client: this.client, body: params, headers, signal }));
  }
}
