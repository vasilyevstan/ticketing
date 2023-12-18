import {
  AListener,
  IOrderCancelledEvent,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { Ticket } from "../../model/Ticket";
import { TicketUpdatedPublisher } from "../publisher/TicketUpdatedPublisher";

export class OrderCancelledListener extends AListener<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error();
    }

    ticket.set({ orderId: undefined });

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
