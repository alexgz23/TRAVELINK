import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  // WebSocket implementation - To be implemented
}
