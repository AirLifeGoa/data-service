import request from 'supertest';
import { app } from '../../../app';

export const signup = async (
  email: string,
  password: string,
  appliedRole: string,
  firstName: string,
  lastName: string,
) => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
      appliedRole,
      firstName,
      lastName,
    })
    .expect(201);
};
