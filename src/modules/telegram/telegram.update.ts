import { Command, Ctx, On, Update, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { InlineQueryResultArticle } from '@telegraf/types/inline';
import { TelegramService } from './telegram.service';

import { ChatInfo, ChatType, UserInfo } from '../../types';
import extractNumberFromCockSizeText from '../../utils/extractNumberFromCockSizeText';
import getSmilesBySize from '../../utils/getSmilesBySize';
import { NotificationService } from '../../services/notification.service';
import config from '../../config';

type Context = SceneContext;

@Update()
export class TelegramUpdate {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly notificationService: NotificationService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    void this.notificationService.sendNotification(
      config.OWNER_TG_ID,
      `NOTIFICATION: Somebody made /start. Name: ${ctx.from.first_name}, Tag: ${ctx.from.username}`,
    );

    await ctx.replyWithHTML(
      `<b>Фановий чат-бот для вимірювання cock-size </b>
Для старту роботи добавте бота в вашу телеграм-групу та надайте йому права адміністратора. 
Щоб виміряти cock-size введіть @CockMeter5_Bot, після цього виберіть запропоновану опцію. 
Щоб показати статистику, введіть команду /stats
Натискати 'Start' не обов'язково, бот буде працювати і без цього!
`,
    );
  }

  @Command('stat')
  async onStatCommand(@Ctx() ctx: Context) {
    const { id: chatTgId, type } = ctx.chat;

    if (!(type === ChatType.SUPER_GROUP || type === ChatType.GROUP)) {
      return;
    }

    const topUsers =
      await this.telegramService.getTopUsersWithMaxAvgSizeByChatTgId(
        chatTgId.toString(),
      );
    const statMessage = `Топ середніх 🍌 чату\n\n${topUsers
      .map(
        (user, index) =>
          `${index + 1}. ${user.userName}  -  <b>${user.averageSize}</b>cm`,
      )
      .join('\n')}`;

    await ctx.replyWithHTML(statMessage);
  }

  @On('text')
  async onTextMessage(@Ctx() ctx: Context) {
    const message = ctx.message as unknown as any;
    const bot = message.via_bot;

    if (!(bot && bot.username === 'CockMeter5_Bot')) {
      return;
    }

    const { text: messageText } = message;
    const sizeValue = extractNumberFromCockSizeText(messageText);

    if (sizeValue === false) {
      void this.notificationService.sendNotification(
        config.OWNER_TG_ID,
        `ERROR: Size error, messageText: ${messageText}`,
      );

      return;
    }

    const chatInfo = {
      chatName: message.chat.title,
      chatTgId: message.chat.id.toString(),
      chatType: message.chat.type,
    } as ChatInfo;

    const userInfo = {
      userTgId: message.from.id.toString(),
      userName: message.from.first_name,
      userTag: message.from.userTag,
    } as UserInfo;

    const isNewChatAdded = await this.telegramService.isNewChatAdded(
      chatInfo.chatTgId,
    );

    if (isNewChatAdded) {
      void this.notificationService.sendNotification(
        config.OWNER_TG_ID,
        `NOTIFICATION: New chat has been added, chatName: ${chatInfo.chatName}`,
      );
    }

    const { user, chat } = await this.telegramService.syncUserAndChat(
      chatInfo,
      userInfo,
    );

    void this.telegramService.saveSize(
      sizeValue,
      user.id,
      user.userTgId,
      chat.id,
    );
  }

  @On('inline_query')
  async onInlineQuery(@Ctx() ctx: Context) {
    const { from } = ctx.inlineQuery;
    const { cachedTimeMS, sizeValue } = await this.telegramService.getSizeData(
      from.id.toString(),
    );

    const queryOptions = [
      {
        type: 'article',
        id: 1,
        title: 'Поділитися своїм розміром з чатом 🍌😱',
        description: 'А це важливо?',
        thumb_url: 'https://i.imgur.com/7a5TamE.jpg',
        input_message_content: {
          message_text: `My cock size is <b>${sizeValue}</b>cm ${getSmilesBySize(
            sizeValue,
          )}`,
          parse_mode: 'HTML',
        },
      },
    ] as unknown as InlineQueryResultArticle[];

    await ctx.answerInlineQuery(queryOptions, {
      is_personal: true,
      cache_time: cachedTimeMS / 1000,
    });
  }
}
