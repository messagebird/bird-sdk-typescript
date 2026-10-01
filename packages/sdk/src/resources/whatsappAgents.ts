// `bird.whatsapp.agents` — the WhatsApp Business Agent on one of your numbers.
// Only its notifications are public; the agent itself is set up in the dashboard.

import { Resource } from "./base.js";
import { WhatsappAgentsNotificationsResource } from "./whatsappAgentsNotifications.gen.js";

export class WhatsappAgentsResource extends Resource {
  readonly notifications: WhatsappAgentsNotificationsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.notifications = new WhatsappAgentsNotificationsResource(core, client);
  }
}
