import { Document, Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// interface that describes the properties of a Ticket
interface ITicket {
  title: string;
  price: number;
  userId: string;
}

// interface to describe properties ofa Ticket model
interface ITicketModel extends Model<ITicketDocument> {
  build(attributes: ITicket): ITicketDocument;
}

// interface describes the properties of the document Ticketodel has
interface ITicketDocument extends Document {
  title: string;
  price: number;
  userId: string;
  version: number; // the plugin will use this field
  orderId?: string;
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
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      // view logic in model - not good approach
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        // delete ret.__v;
      },
      versionKey: false,
    },
  }
);

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.build = (attributes: ITicket) => {
  return new Ticket(attributes);
};

const Ticket = model<ITicketDocument, ITicketModel>("Ticket", TicketSchema);

export { Ticket };
