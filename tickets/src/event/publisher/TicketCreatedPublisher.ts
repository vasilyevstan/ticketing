import { APublisher, Subjects, ITicketCreatedEvent } from "@stantickets/common";

export class TicketCreatedPublisher extends APublisher<ITicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
