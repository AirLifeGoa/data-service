import request from 'supertest';
import { app } from '../../../app';
import { signupAndSignin } from '../../test/auth-helper/signup-signin.helper';

const email = 'test@test.com';
const password = 'password';
const appliedRole = 'user';
const firstName = 'div';
const lastName = 'kam';
it('clears the cookie after signing out', async () => {

  // singup and signin
  const authResponse = await signupAndSignin(email, password, appliedRole, firstName, lastName);

  expect(authResponse.get('Set-Cookie')).toBeDefined();

  // signout
  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
  );
});
