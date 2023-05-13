import request from 'supertest';
import { app } from '../../../app';
import { signup } from '../../test/auth-helper/signup.helper';
import { uuidtoken } from '../../test/auth-helper/uuidtoken.helper';

const email = 'test@test.com';
const password = 'password';
const appliedRole = 'user';
const firstName = 'div';
const lastName = 'kam';
it('returns a 200 on with correct verification token', async () => {

  await signup(email, password, appliedRole, firstName, lastName);
  const response = await request(app)
    .post(`/api/users/verify-email/${uuidtoken}`);
  expect(response.status).toEqual(200);
});

it('returns a 400 with incorrect verification token', async () => {
    await signup(email, password, appliedRole, firstName, lastName);
    const response = await request(app)
      .post(`/api/users/verify-email/invalid-token`);
    expect(response.status).toEqual(400);
  },
);
