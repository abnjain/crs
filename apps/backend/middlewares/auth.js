import { User } from "../models/index.js";
import { verifyJWT } from "../utils/jwt.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token", message: "Authorization header missing" });
    const token = header.split(" ")[1];
    const payload = verifyJWT(token);
    const user = await User.findById(payload.id).select('tokenVersion lastRevocation roles');
    // const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "Invalid token", message: "User not found" });

    // Check version
    if (payload.version !== user.tokenVersion) {
      return res.status(401).json({
        error: "Token invalidated",
        message: "Token version mismatch"
      });
    }

    // Check global revocation
    if (user.lastRevocation && payload.iat < user.lastRevocation.getTime() / 1000) {
      return res.status(401).json({
        error: "Token revoked",
        message: "Token has been globally revoked"
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: "Unauthorized", message: err.message || "Invalid or expired token" });
    // next(err);
  }
};

export default auth;
