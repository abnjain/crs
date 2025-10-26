import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
const SECRET = config.jwt.secret;

function sign(user, opts = { expiresIn: "1h" }, version = user.tokenVersion) {
  return jwt.sign({ id: user._id, roles: user.roles, version }, SECRET, opts);
}

function signRefresh(user, opts = { expiresIn: "7d" }, version = user.tokenVersion) {
  return jwt.sign({ id: user._id, version }, SECRET, opts);
}

function verifyJWT(token) {
  return jwt.verify(token, SECRET);
}

export { sign, signRefresh, verifyJWT };
