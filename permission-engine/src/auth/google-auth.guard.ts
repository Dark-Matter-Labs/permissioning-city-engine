import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard
  extends AuthGuard('google')
  implements CanActivate
{
  canActivate(context: ExecutionContext) {
    // 추가 권한 로직을 넣을 수 있습니다.
    return super.canActivate(context);
  }
}
