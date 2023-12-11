import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggerService } from './services/logger.service';
import { AllExceptionsFilter } from './common/filters/allException.filter';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [TelegramModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [
    {
      provide: 'ILogger',
      useClass: LoggerService,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    LoggerService,
    NotificationService,
  ],
})
export class AppModule {}
