import { Document, Model, Schema, model } from "mongoose";
import { Order, OrderStatus } from "./Order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// interface that describes the properties of a Ticket
interface ITicket {
  id: string;
  title: string;
  price: number;
}

// interface to describe properties ofa Ticket model
interface ITicketModel extends Model<ITicketDocument> {
  build(attributes: ITicket): ITicketDocument;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ITicketDocument | null>;
}

// interface describes the properties of the document Ticketodel has
export interface ITicketDocument extends Document {
  title: string;
  price: number;
  version: number;

  isReserved(): Promise<boolean>;
}

const TicketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // version: {
    //   type: String,
    //   required: true,
    // },
  },
  {
    toJSON: {
      // view logic in model - not good approach
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

TicketSchema.statics.build = (attributes: ITicket) => {
  return new Ticket({
    _id: attributes.id,
    title: attributes.title,
    price: attributes.price,
  });
};

TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.CREATED,
        OrderStatus.AWAITINGPAYMENT,
        OrderStatus.COMPLETE,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = model<ITicketDocument, ITicketModel>("Ticket", TicketSchema);

export { Ticket };
