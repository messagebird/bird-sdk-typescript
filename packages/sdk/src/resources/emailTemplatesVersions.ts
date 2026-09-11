// `bird.email.templates.versions` — the generated version facade plus its nested
// languages collection, which a generated class can't declare.

import { Resource } from "./base.js";
import { EmailTemplatesVersionsResourceBase } from "./emailTemplatesVersions.gen.js";
import { EmailTemplatesVersionsLanguagesResource } from "./emailTemplatesVersionsLanguages.gen.js";

export class EmailTemplatesVersionsResource extends EmailTemplatesVersionsResourceBase {
  /** Per-language content — `bird.email.templates.versions.languages.set(...)`, `.get(...)`, … */
  readonly languages: EmailTemplatesVersionsLanguagesResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.languages = new EmailTemplatesVersionsLanguagesResource(...args);
  }
}
