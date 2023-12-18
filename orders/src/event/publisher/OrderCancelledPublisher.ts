import {
  APublisher,
  IOrderCancelledEvent,
  Subjects,
} from "@stantickets/common";

export class OrderCancelledPublisher extends APublisher<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
