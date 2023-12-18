import { ITicketCreatedEvent, ITicketUpdatedEvent } from "@stantickets/common";
import { TicketUpdatedListener } from "../TicketUpdatedListener";
import { natsWrapper } from "../../../NatsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../model/Ticket";

const setup = async () => {
  // create an instance of a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  // create fake data event
  const data: ITicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "updated concert",
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, data, message, ticket } = await setup();

  // call the onMessage function with data and message objects
  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, message } = await setup();
  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it("does not call ack if the event received out of order", async () => {
  const { listener, data, message, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch (err) {}

  expect(message.ack).not.toHaveBeenCalled();
});
