import bcrypt from 'bcryptjs';

import { IPasswordService } from '../../application/use-cases/auth/login.use-case';

export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds?: number) {
    this.saltRounds = saltRounds || parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
