import { APublisher, Subjects, ITicketUpdatedEvent } from "@stantickets/common";

export class TicketUpdatedPublisher extends APublisher<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
