import { User } from "../models/index.js";
import {verifyJWT} from "../utils/jwt.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token", message: "Authorization header missing" });
    const token = header.split(" ")[1];
    const payload = verifyJWT(token);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "Invalid token", message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized", message: err.message });
    // next(err);
  }
};

export default auth;
