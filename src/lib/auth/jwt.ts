import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_dev_secret_key_at_least_32_characters"
);

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}