import request from "supertest";
import app from "../../src/app";

describe("Auth Flow", () => {
  it("should register, login and access protected route", async () => {
    const agent = request.agent(app); // Agent preserves cookies

    // Signup
    const registerRes = await agent
      .post("/api/auth/signup")
      .set("tenant-id", "tenant123")
      .send({ email: "test@mail.com", password: "Test@123" });

    expect(registerRes.status).toBe(201);

    // Login
    const loginRes = await agent
      .post("/api/auth/login")
      .set("tenant-id", "tenant123")
      .send({ email: "test@mail.com", password: "Test@123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.message).toBe("Login Successful");

    // Access protected route
    const protectedRes = await agent.get("/api/auth/me");

    expect(protectedRes.status).toBe(200);
    expect(protectedRes.body.user).toHaveProperty("email", "test@mail.com");
  });
});