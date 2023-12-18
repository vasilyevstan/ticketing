import { IExpirationCompleteEvent, OrderStatus } from "@stantickets/common";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";
import { natsWrapper } from "../../../NatsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../model/Ticket";
import { Order } from "../../../model/Order";

const setup = async () => {
  // create an instance of a listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    userId: "sdsadsadasd",
    status: OrderStatus.CREATED,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: IExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, message };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("emit order cancelled event", async () => {
  const { listener, order, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, order, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
