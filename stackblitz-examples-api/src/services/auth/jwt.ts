import faker from 'faker';
import jwt from 'jsonwebtoken';
import { random } from 'lodash-es';

import type { Role } from '@prisma/client';

faker.seed(random(100000));
const SECRET =
  process.env['NODE_ENV'] === 'production'
    ? faker.random.word() +
      faker.random.word() +
      faker.random.word() +
      faker.random.word() +
      faker.random.word() +
      faker.random.word()
    : 'VERY_SECRET_TOKEN';

const { verify, sign } = jwt;

export type JWTData = {
  id: number;
  role: Role;
};

export function VerifyAuthToken(token: string) {
  try {
    const jwt = verify(token, SECRET) as JWTData;

    if (jwt && jwt.id && jwt.role) {
      return {
        userId: jwt.id,
        userRole: jwt.role,
        token: SignToken(jwt.id, jwt.role),
      };
    }
  } catch (err) {}
  return null;
}

export function SignToken(id: number, role: Role) {
  const data: JWTData = {
    id,
    role,
  };
  return sign(data, SECRET, {
    expiresIn: '1 day',
  });
}
