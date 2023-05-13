import request from 'supertest';
import { app } from '../../../app';
import { signin } from '../../test/auth-helper/signin.helper';
import { signup } from '../../test/auth-helper/signup.helper';
import { verifyEmail } from '../../test/auth-helper/verify-email.helper';
import { uuidtoken } from '../../test/auth-helper/uuidtoken.helper';

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'div.abc',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'div.abc@gmail.com',
      password: 'p',
      appliedRole: 'user',
    })
    .expect(400);
});

it('fails when an email that doesn\'t exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'div.abc@gmail.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {

  const email = 'test@test.com';
  const password = 'password';
  const firstName = 'div';
  const lastName = 'kam';
  await signup(email, password, 'user', firstName, lastName);
  await request(app)
    .post('/api/users/signin')
    .send({
      email,
      password: 'incorrectPassword',
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  const email = 'test@test.com';
  const password = 'password';
  const firstName = 'div';
  const lastName = 'kam';
  await signup(email, password, 'user', firstName, lastName);
  await verifyEmail(uuidtoken);
  const response = await signin(email, password);

  expect(response.get('Set-Cookie')).toBeDefined();
});

