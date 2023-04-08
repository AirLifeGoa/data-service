import request from 'supertest';
import { app } from '../../../app';

export const verifyEmail = async (uuidtoken: string) => {
  1;
  return request(app)
    .post(`/api/users/verify-email/${uuidtoken}`)
    .expect(200);
};
