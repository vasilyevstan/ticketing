import mongoose from "mongoose";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";
import { IOrderCancelledEvent, OrderStatus } from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../model/Order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    price: 10,
    userId: "dfsdfsdfs",
    version: 0,
  });

  await order.save();

  const data: IOrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "ddsfsdfsd",
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, order };
};

it("updates the status of the order", async () => {
  const { listener, data, message, order } = await setup();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
