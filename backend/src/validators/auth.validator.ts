import z from "zod";

export const loginSchema=z.object({
        email:z.string().trim().email(),
        password:z.string().trim().min(6),
});

export const registerSchema=z.object({
        email:z.string().trim().email(),
        password:z.string().trim().min(6),
});