import { observable } from '@trpc/server/observable';
import { messageEmitter } from '../../common/events';
import { protectedProcedure, publicProcedure } from '../../trpc';
import {
  GetMessagesInputSchema,
  OnMessageAddedInputSchema,
  PostMessageInputSchema,
} from './message.router.types';
import { messageService } from './message.service';

export const messageRouter = {
  getMessages: protectedProcedure
    .input(GetMessagesInputSchema)
    .query(messageService.getMessagesByChannelId),
  postMessage: protectedProcedure
    .input(PostMessageInputSchema)
    .mutation(messageService.createMessage),
  onMessageAdded: publicProcedure
    .input(OnMessageAddedInputSchema)
    .subscription(({ input, ctx }) => {
      return observable(emit => {
        ctx.logger.info({ orgId: input.orgId }, 'Client subscribed to org messages');

        const onMessage = (message: any) => {
          // For now, emit all messages - we'll add orgId filtering once we add org support to the schema
          // TODO: Filter by message.orgId === input.orgId once orgId is added to messages table
          ctx.logger.info(
            { messageId: message.id, channelId: message.channelId },
            'Emitting message to subscriber'
          );
          emit.next(message);
        };

        // Subscribe to message events
        messageEmitter.on('messageAdded', onMessage);

        // Cleanup function
        return () => {
          ctx.logger.info({ orgId: input.orgId }, 'Client unsubscribed from org messages');
          messageEmitter.off('messageAdded', onMessage);
        };
      });
    }),
};
