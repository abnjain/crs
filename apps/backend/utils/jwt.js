import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
const SECRET = config.jwt.secret;
const DEFAULT_ACCESS_EXPIRY = config.jwt.accessExpiry;
const DEFAULT_REFRESH_EXPIRY = config.jwt.refreshExpiry;

function sign(user, opts = {}, version = user.tokenVersion) {
  return jwt.sign({ id: user._id, roles: user.roles, version }, SECRET, {expiresIn: opts?.expiresIn || DEFAULT_ACCESS_EXPIRY});
}

function signRefresh(user, opts = {}, version = user.tokenVersion) {
  return jwt.sign({ id: user._id, version }, SECRET, {expiresIn: opts?.expiresIn || DEFAULT_REFRESH_EXPIRY});
}

function verifyJWT(token) {
  return jwt.verify(token, SECRET);
}

export { sign, signRefresh, verifyJWT };
