import { signup } from './signup.helper';
import { signin } from './signin.helper';
import { verifyEmail } from './verify-email.helper';
import { uuidtoken } from './uuidtoken.helper';

export const signupAndSignin = async (
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string,
) => {
  await signup(email, password, role, firstName, lastName);
  await verifyEmail(uuidtoken);
  return signin(email, password);
};
