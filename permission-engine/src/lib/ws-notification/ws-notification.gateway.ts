import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import { UserService } from 'src/api/user/user.service';
import { Logger } from '../logger/logger.service';

@WebSocketGateway({
  cors: {
    origin: process.env.GOOGLE_CALLBACK_DOMAIN,
    credentials: true,
  },
  transports: ['websocket'],
})
export class WsNotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.log('[WebSocket] WebSocket Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    let roomKey: string | null = null;
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['accessToken'];

      if (!token) {
        throw new UnauthorizedException('No access token found in cookies');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload) {
        throw new UnauthorizedException(`There is no payload in token`);
      }

      const email = payload.email;
      const user = await this.userService.findOneByEmail(email);
      const userId = user.id;
      roomKey = userId;

      if (!user) {
        throw new UnauthorizedException(
          `There is no user with email: ${email}`,
        );
      }

      // Add the client to a room identified by the user id
      client.join(roomKey);
      client.data.userId = userId; // Store the user id in the client data for reference

      this.logger.log(
        `[WebSocket] Client ${client.id} connected as user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        '[WebSocket] Unauthorized WebSocket connection attempt',
        error,
      );

      if (roomKey != null) {
        client.leave(roomKey);
      }
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log('[WebSocket] Client disconnected:', client.id);
  }

  // TODO. handle send_message for user chat
  // @SubscribeMessage('send_message')
  // handleSendMessage(client: Socket, payload: any) {

  // }

  sendNotificationToUser(userId: string, message: string) {
    const sendMessage = this.server
      .to(userId)
      .emit('receive_notification', message);
    this.logger.log('receive_notification', { userId, sendMessage });
  }
}
