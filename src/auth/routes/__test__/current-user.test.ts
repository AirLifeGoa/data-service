import request from 'supertest';
import { app } from '../../../app';
import { signupAndSignin } from '../../test/auth-helper/signup-signin.helper';

const email = 'test@test.com';
const password = 'password';
const firstName = 'div';
const lastName = 'kam';
it('responds with details about the current user', async () => {
  // singup and signin
  const authResponse = await signupAndSignin(email, password, 'user', firstName, lastName);
  const cookie = authResponse.get('Set-Cookie');

  await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('responds with 401 when user not logged in', async () => {
  await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(401);
});



