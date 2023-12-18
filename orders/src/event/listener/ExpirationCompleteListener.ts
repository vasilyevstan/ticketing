import { Message } from "node-nats-streaming";
import {
  Subjects,
  AListener,
  IExpirationCompleteEvent,
  OrderStatus,
} from "@stantickets/common";
import { Order } from "../../model/Order";
import { queueGroupName } from "./QueueGroupName";
import { OrderCancelledPublisher } from "../publisher/OrderCancelledPublisher";

export class ExpirationCompleteListener extends AListener<IExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: IExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.COMPLETE) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.CANCELLED,
      // ticket reference is not reset
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
