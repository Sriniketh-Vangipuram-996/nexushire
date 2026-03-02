import request from "supertest";
import app from "../../src/app";

describe("RBAC Flow", () => {
  it("should block USER from admin route", async () => {
    const agent = request.agent(app); // preserves cookies

    // Signup
    const registerRes = await agent
      .post("/api/auth/signup")
      .set("tenant-id", "tenant123")
      .send({ email: "user@mail.com", password: "User@123" });

    expect(registerRes.status).toBe(201);

    // Login
    const loginRes = await agent
      .post("/api/auth/login")
      .set("tenant-id", "tenant123")
      .send({ email: "user@mail.com", password: "User@123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.message).toBe("Login Successful");

    // Access admin route (RBAC should block USER)
    const adminRes = await agent.get("/api/admin/dashboard");

    expect(adminRes.status).toBe(403); // forbidden
  });
});