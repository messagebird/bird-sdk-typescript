// `bird.contacts` — the generated contact CRUD facade plus the `preferences`
// collection nested under it, which a generated class can't declare.

import { Resource } from "./base.js";
import { ContactsResourceBase } from "./contacts.gen.js";
import { ContactsPreferencesResource } from "./contactsPreferences.gen.js";

export class ContactsResource extends ContactsResourceBase {
  /** A contact's own preferences across every channel — `bird.contacts.preferences.list(contactId)`. */
  readonly preferences: ContactsPreferencesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.preferences = new ContactsPreferencesResource(core, client);
  }
}
