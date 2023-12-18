import { ITicketCreatedEvent } from "@stantickets/common";
import { TicketCreatedListener } from "../TicketCreatedListener";
import { natsWrapper } from "../../../NatsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../model/Ticket";

const setup = async () => {
  // create an instance of a listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data event
  const data: ITicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("creates and saves the ticket", async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with data and message objects
  await listener.onMessage(data, message);
  // assert  ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
