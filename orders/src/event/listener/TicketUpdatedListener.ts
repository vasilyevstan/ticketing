import { Message } from "node-nats-streaming";
import { Subjects, AListener, ITicketUpdatedEvent } from "@stantickets/common";
import { Ticket } from "../../model/Ticket";
import { queueGroupName } from "./QueueGroupName";

export class TicketUpdatedListener extends AListener<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ITicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Element not found");
    }

    const { title, price } = data;

    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
