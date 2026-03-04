// src/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vttanhom3@gmail.com',
      pass: 'fkze pfkg dpax rgym',
    },
  });

  async sendVerifyEmail(email: string, token: string) {
    // const url = `http://localhost:4000/auth/verify?token=${token}`;
    const url = `http://localhost:5173/verify-email?token=${token}`;// Frontend URL for email verification

    await this.transporter.sendMail({
      from: '"HaStore" <yourgmail@gmail.com>',
      to: email,
      subject: 'Verify your account',
      html: `
        <h3>Click link to verify</h3>
        <a href="${url}">${url}</a>
      `,
    });
  }
}