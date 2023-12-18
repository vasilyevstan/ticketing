import { Document, Model, Schema, model } from "mongoose";
import { Password } from "../service/Password";

// interface that describes the properties of a user
interface IUser {
  email: string;
  password: string;
}

// interface to describe properties ofa user model
interface IUserModel extends Model<IUserDocument> {
  build(attributes: IUser): IUserDocument;
}

// interface describes the properties of the document Userodel has
interface IUserDocument extends Document {
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // view logic in model - not good approach
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        // delete ret.__v;
      },
      versionKey: false,
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashedPassword = await Password.toHash(this.get("password"));

    this.set("password", hashedPassword);
    done();
  }
});

userSchema.statics.build = (attributes: IUser) => {
  return new User(attributes);
};

const User = model<IUserDocument, IUserModel>("User", userSchema);

export { User };
