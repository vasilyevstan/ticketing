import { APublisher } from "./APublisher";
import { ITicketCreatedEvent } from "./ITicketCreatedEvent";
import { Subjects } from "./subjects";

export class TicketCreatedPublisher extends APublisher<ITicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
