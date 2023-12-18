import {
  AListener,
  IOrderCreatedEvent,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { Ticket } from "../../model/Ticket";
import { TicketUpdatedPublisher } from "../publisher/TicketUpdatedPublisher";

export class OrderCreatedListener extends AListener<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error();
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    // have to emit an event as we update the version of a ticket
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
