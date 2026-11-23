// `bird.email.blocks` — the generated block facade plus its nested languages
// collection, which a generated class can't declare.

import { Resource } from "./base.js";
import { EmailBlocksResourceBase } from "./emailBlocks.gen.js";
import { EmailBlocksLanguagesResource } from "./emailBlocksLanguages.js";

export class EmailBlocksResource extends EmailBlocksResourceBase {
  /** Per-language drafts — `bird.email.blocks.languages.set(...)`, `.get(...)`, `.revisions.list(...)`, … */
  readonly languages: EmailBlocksLanguagesResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.languages = new EmailBlocksLanguagesResource(...args);
  }
}
