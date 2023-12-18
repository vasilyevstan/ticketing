import {
  Subjects,
  AListener,
  IPaymentCreatedEvent,
  OrderStatus,
} from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { Order } from "../../model/Order";

export class PaymentCreatedListener extends AListener<IPaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IPaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.COMPLETE,
    });

    await order.save();

    // order was updated so there should be order updated event
    // however, order is in complete state now

    msg.ack();
  }
}
