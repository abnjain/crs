import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.JWT_SECRET;

function sign(user, opts = { expiresIn: "15m" }) {
  return jwt.sign({ id: user._id, roles: user.roles }, SECRET, opts);
}

function signRefresh(user, opts = { expiresIn: "7d" }) {
  return jwt.sign({ id: user._id }, SECRET, opts);
}

function verifyJWT(token) {
  return jwt.verify(token, SECRET);
}

export { sign, signRefresh, verifyJWT };
