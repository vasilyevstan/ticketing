import {
  APublisher,
  Subjects,
  IPaymentCreatedEvent,
} from "@stantickets/common";

export class PaymentCreatedPublisher extends APublisher<IPaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
