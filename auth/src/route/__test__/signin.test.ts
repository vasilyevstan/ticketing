import request from "supertest";
import { app } from "../../app";

it("returns 200 on successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
});

it("fails when email that does not exists is supplied and no user created", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test2.com",
      password: "password",
    })
    .expect(400);
});

it("fails when email that does not exists is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test2.com",
      password: "password",
    })
    .expect(400);
});

it("fails incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  return await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password2",
    })
    .expect(400);
});

it("response with a cookie with valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
