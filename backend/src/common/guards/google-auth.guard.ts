import { Injectable, ExecutionContext, NotImplementedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const googleOAuthEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!googleOAuthEnabled) {
      throw new NotImplementedException('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    }
    return super.canActivate(context);
  }
}
