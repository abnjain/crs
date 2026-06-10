/**
 * Verify CRS access JWT and return the user id payload.
 */
import jwt, { type Algorithm, type JwtPayload } from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AccessTokenPayload {
  id: string;
}

function isAccessTokenPayload(value: JwtPayload | string): value is AccessTokenPayload & JwtPayload {
  return typeof value === 'object' && value !== null && typeof value.id === 'string';
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!config.jwtVerifyKey) {
    throw new jwt.JsonWebTokenError('JWT verification key not configured');
  }

  const decoded = jwt.verify(token, config.jwtVerifyKey, {
    algorithms: [config.jwtAlgorithm as Algorithm],
  });

  if (typeof decoded === 'string' || !isAccessTokenPayload(decoded)) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }

  return { id: decoded.id };
}
