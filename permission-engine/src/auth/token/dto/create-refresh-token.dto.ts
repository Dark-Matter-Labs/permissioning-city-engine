import { User } from 'src/database/entity/user.entity';

export class CreateRefreshTokenDto {
  token: string;

  user: User;

  expiresAt: Date;
}
