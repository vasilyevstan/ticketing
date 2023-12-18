import { Message } from "node-nats-streaming";
import { Subjects, AListener, ITicketCreatedEvent } from "@stantickets/common";
import { Ticket } from "../../model/Ticket";
import { queueGroupName } from "./QueueGroupName";

export class TicketCreatedListener extends AListener<ITicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
    });

    await ticket.save();

    msg.ack();
  }
}
