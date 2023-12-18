import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../model/User";
import { BadRequestError, validateRequest } from "@stantickets/common";
import { Password } from "../service/Password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    // const passwordMatch = await Password.compare(
    //   existingUser.password,
    //   password
    // );

    if (!(await Password.compare(existingUser.password, password))) {
      throw new BadRequestError("Invalid credentials");
    }

    // generate jwt
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // store jwt in session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
