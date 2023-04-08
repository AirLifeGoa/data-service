import request from 'supertest';
import { app } from '../../../app';
import { signupAndSignin } from '../../test/auth-helper/signup-signin.helper';
import { uuidtoken } from '../../test/auth-helper/uuidtoken.helper';

const email = 'test@test.com';
const password = 'password';
const appliedRole = 'user';
const firstName = 'div';
const lastName = 'kam';

it('sends password reset email with correct email id', async () => {
  await signupAndSignin(email, password, appliedRole, firstName, lastName);
  await request(app)
    .post('/api/users/forgot-password')
    .send({
      email,
    })
    .expect(200);
});

it('returns 400 with invalid email', async () => {
  await signupAndSignin(email, password, appliedRole, firstName, lastName);
  await request(app)
    .post('/api/users/forgot-password')
    .send({
      email: 'hest@best.com',
    })
    .expect(400);
});

it('returns 201 when resetting password', async () => {
  await signupAndSignin(email, password, appliedRole, firstName, lastName);
  await request(app)
    .post('/api/users/forgot-password')
    .send({
      email,
    })
    .expect(200);

  await request(app)
    .post(`/api/users/reset-password/${uuidtoken}`)
    .send({
      newPassword: 'newPassword',
    })
    .expect(204);
});

it('returns 400 when resetting password with invalid token', async () => {
  await signupAndSignin(email, password, appliedRole, firstName, lastName);
  await request(app)
    .post('/api/users/forgot-password')
    .send({
      email,
    })
    .expect(200);

  await request(app)
    .post(`/api/users/reset-password/invalid-token`)
    .send({
      newPassword: 'invalid-password',
    })
    .expect(400);
});
