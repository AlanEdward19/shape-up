interface ChatConversationProps {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

const ChatConversation = ({ profileId, firstName, lastName, imageUrl }: ChatConversationProps) => {
  return (
    <div className="flex flex-col h-[500px]">
      <ChatHeader
        profileId={profileId}
        firstName={firstName}
        lastName={lastName}
        imageUrl={imageUrl}
      />
      <ChatMessageList profileId={profileId} />
      <ChatInput />
    </div>
  );
};

export default ChatConversation;