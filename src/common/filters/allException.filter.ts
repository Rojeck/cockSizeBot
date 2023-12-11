import { ExceptionFilter, Catch } from '@nestjs/common';
import { LoggerService } from '../../services/logger.service';
import { NotificationService } from '../../services/notification.service';
import config from '../../config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private loggerService: LoggerService,
    private notificationService: NotificationService,
  ) {}

  catch(exception: any, host: any) {
    this.loggerService.error(exception);

    const isTelegramException = host?.args[0]?.message;

    if (isTelegramException) {
      const userData = {
        userName: isTelegramException?.from?.first_name,
        firstName: isTelegramException?.from?.username,
        id: isTelegramException?.from?.id,
      };
      const chatData = {
        chatName: isTelegramException?.chat?.title,
        type: isTelegramException?.chat?.type,
        id: isTelegramException?.chat?.id,
      };
      const messageText = isTelegramException?.text;

      void this.notificationService.sendNotification(
        config.OWNER_TG_ID,
        `ERROR: telegram error, exception: ${exception}, \n
        HostInfo: 
        userName - ${userData.userName},\n 
        userTag ${userData.firstName},\n
        userId: ${userData.id}: chatName: ${chatData.chatName},\n 
        chatId: ${chatData.id},\n
        chatType: ${chatData.type},\n
        messageText: ${messageText}`,
      );

      return;
    }

    void this.notificationService.sendNotification(
      config.OWNER_TG_ID,
      `ERROR: general error, exception: ${exception}`,
    );

    return null;
  }
}
