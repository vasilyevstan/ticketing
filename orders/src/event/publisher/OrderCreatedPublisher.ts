import { APublisher, IOrderCreatedEvent, Subjects } from "@stantickets/common";

export class OrderCreatedPublisher extends APublisher<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
