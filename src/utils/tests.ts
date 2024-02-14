import prisma from '../db/prismaClient';
import bcrypt from 'bcrypt';
import { EMAIL_USER, transporter } from '../emailing/transporter';

const testValues = {
  userName: 'test-user',
  userEmail: EMAIL_USER,
  userPassword: 'testPassword'
};

const testEmail = {
  from: `"TidyTodo" <${EMAIL_USER}>`,
  to: EMAIL_USER,
  subject: 'TidyTodo - test email',
  text: `Emails are working properly`,
  html: `
    <span>Emails are working properly</span>
  `
};

export async function testEnvVariables() {
  //TODO Add env variables test
  console.log('Testing env variables');
}

export async function testDatabase() {
  await prisma.user.create({
    data: {
      name: testValues.userName,
      email: testValues.userEmail,
      password: await bcrypt.hash(testValues.userPassword, 10)
    }
  });

  await prisma.user.delete({
    where: {
      email: testValues.userEmail
    }
  });

  console.log('Database is working properly');
}

export async function testEmailing() {
  await transporter.sendMail(testEmail);

  console.log(
    'Emails are working properly. You should have received a test email at provided adress.'
  );
}
