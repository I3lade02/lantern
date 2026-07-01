"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MessageCircleMore,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { ChatComposer } from "@/features/chat/chat-composer";
import { ChatMessageItem } from "@/features/chat/chat-message-item";
import {
  getChatErrorMessage,
  sendGlobalChatMessage,
  softDeleteGlobalChatMessage,
  updateOwnGlobalChatMessage,
} from "@/features/chat/chat-service";
import { useGlobalChatMessages } from "@/features/chat/use-global-chat-messages";
import {
  markChatAsRead,
} from "@/features/notifications/notification-service";
import {
  CHAT_RECENT_MESSAGE_LIMIT,
  type ChatMessage,
} from "@/types/chat";

export function ChatPageContent() {
  const {
    profile,
    profileStatus,
    status,
    user,
  } = useAuth();

  const isReady =
    status === "authenticated" &&
    profileStatus === "ready" &&
    Boolean(user) &&
    Boolean(profile);

  const userId = user?.uid ?? null;

  const {
    messages,
    isLoading,
    error,
  } = useGlobalChatMessages(isReady);

  const [isSending, setIsSending] = useState(false);

  const [savingMessageId, setSavingMessageId] =
    useState<string | null>(null);

  const [messageToDelete, setMessageToDelete] =
    useState<ChatMessage | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const messageListRef = useRef<HTMLDivElement | null>(
    null,
  );

  const hasPositionedInitialMessagesRef = useRef(false);

  const shouldStickToBottomRef = useRef(true);

  const hasMarkedInitialChatReadRef = useRef(false);

  const lastObservedExternalMessageKeyRef =
    useRef<string | null>(null);

  const latestMessage = messages.at(-1);

  const latestMessageKey = latestMessage
    ? `${latestMessage.id}:${latestMessage.updatedAt?.toMillis() ?? "pending"}`
    : "empty";

  const latestExternalMessage = [...messages]
  .reverse()
  .find(
    (message) =>
      !message.isDeleted &&
      message.authorId !== userId &&
      message.createdAt !== null,
    );

  const latestExternalMessageKey =
    latestExternalMessage?.createdAt
      ? `${latestExternalMessage.id}:${latestExternalMessage.createdAt.toMillis()}`
      : null;

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    hasMarkedInitialChatReadRef.current = false;

    lastObservedExternalMessageKeyRef.current = null;
  }, [userId]);

useEffect(() => {
  if (
    !isReady ||
    isLoading ||
    !userId ||
    hasMarkedInitialChatReadRef.current
  ) {
    return;
  }

  hasMarkedInitialChatReadRef.current = true;

  lastObservedExternalMessageKeyRef.current =
    latestExternalMessageKey;

  void markChatAsRead(userId).catch((markError) => {
    console.error(
      "Nepodařilo se označit chat jako přečtený:",
      markError,
    );
  });
}, [
  isLoading,
  isReady,
  latestExternalMessageKey,
  userId,
]);

useEffect(() => {
  if (
    !isReady ||
    !userId ||
    !hasMarkedInitialChatReadRef.current ||
    !latestExternalMessageKey ||
    latestExternalMessageKey ===
      lastObservedExternalMessageKeyRef.current
  ) {
    return;
  }

  lastObservedExternalMessageKeyRef.current =
    latestExternalMessageKey;

  void markChatAsRead(userId).catch((markError) => {
    console.error(
      "Nepodařilo se označit novou zprávu jako přečtenou:",
      markError,
    );
  });
}, [
  isReady,
  latestExternalMessageKey,
  userId,
]);

  useEffect(() => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    if (
      hasPositionedInitialMessagesRef.current &&
      !shouldStickToBottomRef.current
    ) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      const currentMessageList = messageListRef.current;

      if (!currentMessageList) {
        return;
      }

      currentMessageList.scrollTop =
        currentMessageList.scrollHeight;

      hasPositionedInitialMessagesRef.current = true;
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [latestMessageKey]);

  function scrollToBottom() {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    requestAnimationFrame(() => {
      const currentMessageList = messageListRef.current;

      if (!currentMessageList) {
        return;
      }

      currentMessageList.scrollTop =
        currentMessageList.scrollHeight;

      shouldStickToBottomRef.current = true;
    });
  }

  function handleMessageListScroll() {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    const distanceFromBottom =
      messageList.scrollHeight -
      messageList.scrollTop -
      messageList.clientHeight;

    shouldStickToBottomRef.current =
      distanceFromBottom < 96;
  }

  async function handleSend(
    text: string,
  ): Promise<boolean> {
    if (!user || !profile) {
      toast.error("Profil člena není připravený.");
      return false;
    }

    setIsSending(true);

    try {
      await sendGlobalChatMessage(
        {
          id: user.uid,
          name: profile.displayName,
          avatarColor: profile.avatarColor,
        },
        text,
      );

      scrollToBottom();

      return true;
    } catch (sendError) {
      toast.error(getChatErrorMessage(sendError));
      return false;
    } finally {
      setIsSending(false);
    }
  }

  async function handleEdit(
    message: ChatMessage,
    nextText: string,
  ): Promise<boolean> {
    setSavingMessageId(message.id);

    try {
      await updateOwnGlobalChatMessage(
        message.id,
        nextText,
      );

      return true;
    } catch (editError) {
      toast.error(getChatErrorMessage(editError));
      return false;
    } finally {
      setSavingMessageId(null);
    }
  }

  async function handleDeleteMessage() {
    if (!messageToDelete || !user) {
      return;
    }

    setIsDeleting(true);

    try {
      await softDeleteGlobalChatMessage(
        messageToDelete.id,
        user.uid,
      );

      toast.success("Zpráva byla smazána.");
      setMessageToDelete(null);
    } catch (deleteError) {
      toast.error(getChatErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isReady || isLoading) {
    return <LoadingState label="Rozsvěcím party chat…" />;
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        <PixelPanel tone="deep">
          <p className="font-pixel text-[10px] text-wine-light">
            CHAT ERROR
          </p>

          <h1 className="mt-4 font-pixel text-base text-cream">
            Chat se nepodařilo načíst
          </h1>

          <p className="mt-4 text-sm leading-7 text-cream-muted">
            {error}
          </p>
        </PixelPanel>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-5 py-8 pb-16">
        <section className="flex flex-col gap-5 border-b-2 border-outline pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-pixel text-[10px] leading-6 text-amber-light">
              PARTY FREQUENCY
            </p>

            <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
              Party chat
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
              Společná herní frekvence pro domluvy, odkazy,
              meme energii a otázky typu „kdo vezme kostky?“
            </p>
          </div>

          <div className="flex items-center gap-3 border-2 border-outline bg-panel-deep px-4 py-3 text-cream-muted shadow-pixel-sm">
            <MessageCircleMore
              aria-hidden="true"
              className="text-amber-light"
              size={19}
            />

            <span className="font-pixel text-[8px]">
              POSLEDNÍCH {CHAT_RECENT_MESSAGE_LIMIT} ZPRÁV
            </span>
          </div>
        </section>

        <section className="mt-8">
          <PixelPanel
            className="overflow-hidden p-0!"
            tone="deep"
          >
            <div
              className="max-h-[calc(100dvh-23rem)] min-h-100 overflow-y-auto"
              onScroll={handleMessageListScroll}
              ref={messageListRef}
            >
              {messages.length === 0 ? (
                <div className="grid min-h-100 place-items-center p-6">
                  <EmptyState
                    description="Chat je zatím tichý. První zpráva může rozhodnout o pizze, hře i osudu celé party."
                    icon={MessageCircleMore}
                    title="Zatím žádné zprávy"
                  />
                </div>
              ) : (
                <div>
                  {messages.map((message) => (
                    <ChatMessageItem
                      currentUserId={user?.uid ?? ""}
                      isAdmin={isAdmin}
                      isSaving={savingMessageId === message.id}
                      key={`${message.id}-${message.updatedAt?.toMillis() ?? "pending"}`}
                      message={message}
                      onEdit={handleEdit}
                      onRequestDelete={setMessageToDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            <ChatComposer
              disabled={!user || !profile}
              isSending={isSending}
              onSend={handleSend}
            />
          </PixelPanel>
        </section>
      </main>

      {messageToDelete ? (
        <PixelModal
          description={
            messageToDelete.authorId === user?.uid
              ? "Zpráva nezmizí úplně. V chatu zůstane informace, že byla smazána."
              : "Jako admin můžeš cizí zprávu smazat. V chatu po ní zůstane informace, že byla odstraněna."
          }
          onClose={() => {
            if (!isDeleting) {
              setMessageToDelete(null);
            }
          }}
          open
          size="sm"
          title="Smazat zprávu?"
        >
          <div className="border-2 border-outline bg-panel-deep p-4">
            <p className="font-pixel text-[8px] text-cream-muted">
              AUTOR
            </p>

            <p className="mt-2 text-sm font-semibold text-cream">
              {messageToDelete.authorName}
            </p>

            <p className="mt-3 line-clamp-4 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-cream-muted">
              {messageToDelete.text}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <PixelButton
              disabled={isDeleting}
              onClick={() => setMessageToDelete(null)}
              variant="ghost"
            >
              Zrušit
            </PixelButton>

            <PixelButton
              disabled={isDeleting}
              onClick={() => {
                void handleDeleteMessage();
              }}
              variant="wine"
            >
              <Trash2 aria-hidden="true" size={16} />
              {isDeleting ? "Mažu…" : "Smazat zprávu"}
            </PixelButton>
          </div>
        </PixelModal>
      ) : null}
    </>
  );
}