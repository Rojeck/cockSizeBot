import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { TelegrafModule } from 'nestjs-telegraf';
import options from './telegram-config.factory';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../../services/prisma.service';
import { NotificationService } from '../../services/notification.service';
import { LoggerService } from '../../services/logger.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TelegrafModule.forRootAsync(options())],
  providers: [
    TelegramUpdate,
    TelegramService,
    PrismaService,
    NotificationService,
    LoggerService,
    ConfigService,
  ],
})
export class TelegramModule {}
