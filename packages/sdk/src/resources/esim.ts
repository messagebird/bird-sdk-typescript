import { EsimResourceBase } from "./esim.gen.js";
import { EsimAssignmentResource } from "./esimAssignment.gen.js";
import { EsimCredentialsResource } from "./esimCredentials.gen.js";
import { EsimDeliveriesResource } from "./esimDeliveries.gen.js";
import { EsimInstallLinksResource } from "./esimInstallLinks.gen.js";
import { EsimOffersResource } from "./esimOffers.gen.js";
import { EsimOrdersResource } from "./esimOrders.gen.js";
import { EsimPackagesResource } from "./esimPackages.gen.js";
import { EsimRecurringSubscriptionsResource } from "./esimRecurringSubscriptions.gen.js";
import { EsimSettingsResource } from "./esimSettings.gen.js";
import { EsimSubscribersResource } from "./esimSubscribers.gen.js";
import { EsimZonesResource } from "./esimZones.gen.js";

export class EsimResource extends EsimResourceBase {
  readonly assignment: EsimAssignmentResource;
  readonly credentials: EsimCredentialsResource;
  readonly deliveries: EsimDeliveriesResource;
  readonly installLinks: EsimInstallLinksResource;
  readonly offers: EsimOffersResource;
  readonly orders: EsimOrdersResource;
  readonly packages: EsimPackagesResource;
  readonly recurringSubscriptions: EsimRecurringSubscriptionsResource;
  readonly settings: EsimSettingsResource;
  readonly subscribers: EsimSubscribersResource;
  readonly zones: EsimZonesResource;

  constructor(...args: ConstructorParameters<typeof EsimResourceBase>) {
    super(...args);
    this.assignment = new EsimAssignmentResource(...args);
    this.credentials = new EsimCredentialsResource(...args);
    this.deliveries = new EsimDeliveriesResource(...args);
    this.installLinks = new EsimInstallLinksResource(...args);
    this.offers = new EsimOffersResource(...args);
    this.orders = new EsimOrdersResource(...args);
    this.packages = new EsimPackagesResource(...args);
    this.recurringSubscriptions = new EsimRecurringSubscriptionsResource(...args);
    this.settings = new EsimSettingsResource(...args);
    this.subscribers = new EsimSubscribersResource(...args);
    this.zones = new EsimZonesResource(...args);
  }
}
