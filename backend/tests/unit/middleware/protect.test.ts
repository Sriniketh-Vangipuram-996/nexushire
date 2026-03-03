import jwt from "jsonwebtoken";
import { protect } from "../../../src/common/middleware/protect";

jest.mock("jsonwebtoken");

describe("Protect Middleware", () => {
  it("should attach user to request", async () => {
    const req: any = {
      cookies: {
        access_token: "validtoken",
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "123",
      role: "user",
      tenantId: "tenant123",
    });

    await protect(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe("123");
    expect(next).toHaveBeenCalled();
  });
});