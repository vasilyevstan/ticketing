import {
  AListener,
  IOrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { Order } from "../../model/Order";
// import { Ticket } from "../../model/Ticket";
// import { TicketUpdatedPublisher } from "../publisher/TicketUpdatedPublisher";

export class OrderCancelledListener extends AListener<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.CANCELLED });
    await order.save();

    msg.ack();
  }
}
