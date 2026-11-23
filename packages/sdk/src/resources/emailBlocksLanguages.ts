// `bird.email.blocks.languages` — the generated language facade plus its nested
// revisions collection, which a generated class can't declare.

import { Resource } from "./base.js";
import { EmailBlocksLanguagesResourceBase } from "./emailBlocksLanguages.gen.js";
import { EmailBlocksLanguagesRevisionsResource } from "./emailBlocksLanguagesRevisions.gen.js";

export class EmailBlocksLanguagesResource extends EmailBlocksLanguagesResourceBase {
  /** Published history — `bird.email.blocks.languages.revisions.list(...)`, `.get(...)` */
  readonly revisions: EmailBlocksLanguagesRevisionsResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.revisions = new EmailBlocksLanguagesRevisionsResource(...args);
  }
}
