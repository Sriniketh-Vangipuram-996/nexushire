import { signup } from "../../../src/api/v1/controllers/authController";
import User from "../../../src/models/User";
import { Tenant } from "../../../src/models/Tenant";
import bcrypt from "bcryptjs";

jest.mock("../../../src/models/User");
jest.mock("../../../src/models/Tenant");
jest.mock("../../../src/utils/sendEmail");
jest.mock("../../../src/utils/emailToken");
jest.mock("bcryptjs");

describe("Auth Controller - registerUser", () => {
  it("should create new user", async () => {
    const req: any = {
      body: {
        email: "test@gmail.com",
        password: "Test@123"
      }
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpass");

    (Tenant.create as jest.Mock).mockResolvedValue({
      _id: "tenant1"
    });

    (User.create as jest.Mock).mockResolvedValue({
      _id: "1",
      email: "test@gmail.com"
    });

    await signup(req, res);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});