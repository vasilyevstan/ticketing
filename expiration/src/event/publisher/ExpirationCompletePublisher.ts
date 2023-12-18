import {
  APublisher,
  IExpirationCompleteEvent,
  Subjects,
} from "@stantickets/common";

export class ExpirationCompletePublisher extends APublisher<IExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
