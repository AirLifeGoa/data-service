import request from 'supertest';
import { app } from '../../../app';
import { signup } from '../../test/auth-helper/signup.helper';

const email = 'test@test.com';
const password = 'password';
const firstName = 'div';
const lastName = 'kam';
const appliedRole = 'user';
it('returns a 201 on successful signup', async () => {
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

});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'div.abc',
      password: 'password',
      appliedRole: 'user',
      firstName: 'div',
      lastName: 'kam',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'div.abc@gmail.com',
      password: 'p',
      appliedRole: 'user',
      firstName: 'div',
      lastName: 'kam',
    })
    .expect(400);
});

it('returns a 400 with an invalid appliedRole', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'div.abc@gmail.com',
      password: 'password',
      appliedRole: 'invalid',
      firstName: 'div',
      lastName: 'kam',
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {

  await signup(email, password, 'user', firstName, lastName);

  await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
      appliedRole,
      firstName,
      lastName,
    })
    .expect(400);
});

