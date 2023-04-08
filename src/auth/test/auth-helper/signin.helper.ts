import request from 'supertest';
import { app } from '../../../app';

export const signin = async (email: string, password: string) => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email,
      password,
    })
    .expect(200);
};
