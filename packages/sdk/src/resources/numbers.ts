// `bird.numbers` — the numbers a workspace holds, plus the `available` search
// and the `orders` that turn one into the other.
//
// Buying is an order rather than a direct create: most complete inside the
// request, but one that has to wait on a carrier comes back pending and is
// polled through `bird.numbers.orders.get(...)`.

import { Resource } from "./base.js";
import {
  NumbersResourceBase,
  type Number,
  type NumbersListQuery,
} from "./numbers.gen.js";
import {
  NumbersAvailableResource,
  type AvailableNumber,
  type NumbersAvailableListQuery,
} from "./numbersAvailable.gen.js";
import {
  NumbersOrdersResource,
  type NumbersOrder,
  type NumbersOrdersListQuery,
} from "./numbersOrders.gen.js";

export type {
  AvailableNumber,
  Number,
  NumbersAvailableListQuery,
  NumbersListQuery,
  NumbersOrder,
  NumbersOrdersListQuery,
};

export class NumbersResource extends NumbersResourceBase {
  /** Numbers on sale — `bird.numbers.available.list(...)`, `.get(...)`. */
  readonly available: NumbersAvailableResource;

  /** Purchases — `bird.numbers.orders.create(...)`, `.list(...)`, `.get(...)`. */
  readonly orders: NumbersOrdersResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.available = new NumbersAvailableResource(core, client);
    this.orders = new NumbersOrdersResource(core, client);
  }
}
