import { Message } from "node-nats-streaming";
import { AListener } from "./AListener";
import { ITicketCreatedEvent } from "./ITicketCreatedEvent";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends AListener<ITicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: ITicketCreatedEvent["data"], msg: Message): void {
    console.log("Handling message", data);

    msg.ack();
  }
}
