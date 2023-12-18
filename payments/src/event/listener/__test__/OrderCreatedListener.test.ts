import mongoose from "mongoose";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { IOrderCreatedEvent, OrderStatus } from "@stantickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../model/Order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: IOrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.CREATED,
    userId: "dsfsdfsddsf",
    expiresAt: "dsfsdfsdfdsf",
    ticket: {
      id: "asdasdasdasd",
      price: 10,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("replicated the order info", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
