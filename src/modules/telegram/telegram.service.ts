import { Injectable } from '@nestjs/common';
import { Chat, User } from '@prisma/client';

import generateRandomValue from '../../utils/generateRandomSize';
import { PrismaService } from '../../services/prisma.service';
import { ChatInfo, SizeData, TopUserResponse, UserInfo } from '../../types';
import config from '../../config';

@Injectable()
export class TelegramService {
  constructor(private prismaService: PrismaService) {}

  private async getLatestSizeData(
    userTgId: string,
    chatId?: number,
  ): Promise<SizeData | null> {
    const latestSize = await this.prismaService.size.findFirst({
      where: {
        user: {
          userTgId,
        },
        ...(chatId && { chat: { id: chatId } }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestSize) {
      return null;
    }

    const currentDateMS = new Date().getTime();
    const targetDateMS = new Date(latestSize.createdAt).getTime();
    // Calculate the remaining cache time before updating the size value
    const cachedTimeMS =
      Number(config.CACHED_TIME_MS) - (currentDateMS - targetDateMS);

    // Return the previous size of the data with the newly cached time
    if (cachedTimeMS > 0) {
      return {
        cachedTimeMS,
        sizeValue: latestSize.sizeValue,
      };
    }

    return null;
  }

  async getSizeData(userTgId: string): Promise<SizeData> {
    const sizeData = await this.getLatestSizeData(userTgId);

    if (sizeData) {
      return sizeData;
    }

    return {
      cachedTimeMS: Number(config.CACHED_TIME_MS),
      sizeValue: generateRandomValue(),
    };
  }

  async saveSize(
    sizeValue: number,
    userId: number,
    userTgId: string,
    chatId: number,
  ): Promise<void> {
    const latestSizeData = await this.getLatestSizeData(userTgId, chatId);

    if (latestSizeData) {
      return;
    }

    await this.prismaService.size.create({
      data: {
        sizeValue,
        chat: { connect: { id: chatId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async getTopUsersWithMaxAvgSizeByChatTgId(
    chatTgId: string,
  ): Promise<TopUserResponse[]> {
    const usersWithMaxAverageSize = await this.prismaService.$queryRaw`
SELECT 
  u."userName",
  AVG(CASE WHEN sc."chatTgId" = CAST(${chatTgId} AS TEXT) THEN s."sizeValue" ELSE NULL END) AS "averageSize"
FROM
  "User" u
JOIN
  "_ChatToUser" ctu ON u."id" = ctu."B"
JOIN
  "Chat" c ON ctu."A" = c."id"
JOIN
  "Size" s ON u."id" = s."userId"
JOIN
  "Chat" sc ON c."id" = s."chatId"
WHERE
  c."chatTgId" = CAST(${chatTgId} AS TEXT)
GROUP BY
  u."userName"
ORDER BY
  "averageSize" DESC
LIMIT
  10;`;

    return (usersWithMaxAverageSize as TopUserResponse[]).map(
      ({ userName, averageSize }) => ({
        userName,
        averageSize: parseFloat(averageSize.toFixed(2)),
      }),
    );
  }

  async syncUserAndChat(
    chatInfo: ChatInfo,
    userInfo: UserInfo,
  ): Promise<{ chat: Chat; user: User }> {
    const { userTgId, userTag, userName } = userInfo;
    const { chatTgId, chatName } = chatInfo;

    const user = await this.prismaService.user.upsert({
      where: { userTgId },
      create: {
        userTgId,
        userTag,
        userName,
      },
      update: {
        userTag,
        userName,
      },
    });

    const chat = await this.prismaService.chat.upsert({
      where: { chatTgId },
      create: {
        chatTgId,
        chatName,
        users: { connect: { id: user.id } },
      },
      update: {
        chatName,
        users: { connect: { id: user.id } },
      },
    });

    return { chat, user };
  }

  async isNewChatAdded(chatTgId: string): Promise<boolean> {
    const existingChat = await this.prismaService.chat.findUnique({
      where: { chatTgId },
    });

    return !existingChat;
  }
}
