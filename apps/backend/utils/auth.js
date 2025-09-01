import jwt from "jsonwebtoken";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// ✅ JWT verification
export const verifyJWTAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    // ✅ Check revocation
    const revoked = await redis.get(`revoked:${token}`);
    if (revoked) return res.status(401).json({ error: "Token revoked" });

    req.user = decoded;
    next();
  });
};

// ✅ Token Revocation
export const revokeToken = async (req, res, next) => {
  res.revoke = async (token) => {
    await redis.set(`revoked:${token}`, "true", "EX", 60 * 60 * 24); // 1 day
  };
  next();
};
