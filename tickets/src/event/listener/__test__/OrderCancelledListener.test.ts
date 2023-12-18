import { OrderCancelledListener } from "../OrderCancelledListener";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../model/Ticket";
import { IOrderCancelledEvent, OrderStatus } from "@stantickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "kljhjhjhjh",
  });

  ticket.set({ orderId });

  await ticket.save();

  const data: IOrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  const message: Message = {
    ack: jest.fn(),
    getSubject: jest.fn(),
    getSequence: jest.fn(),
    getRawData: jest.fn(),
    getData: jest.fn(),
    getTimestampRaw: jest.fn(),
    getTimestamp: jest.fn(),
    isRedelivered: jest.fn(),
    getCrc32: jest.fn(),
  };

  return { listener, ticket, data, message, orderId };
};

it("updates the ticket, publishes event and acks the message", async () => {
  const { listener, ticket, data, message, orderId } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(message.ack).toHaveBeenCalled();
});
