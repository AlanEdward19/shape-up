export enum ReactionType {
  Like = 0,
  Dislike = 1,
  Love = 2,
  Haha = 3,
  Wow = 4,
  Sad = 5,
  Angry = 6,
  Care = 7,
  Support = 8,
  Celebrate = 9
}

export const reactionEmojis: Record<ReactionType, string> = {
  [ReactionType.Like]: "👍",
  [ReactionType.Dislike]: "👎",
  [ReactionType.Love]: "❤️",
  [ReactionType.Haha]: "😄",
  [ReactionType.Wow]: "😮",
  [ReactionType.Sad]: "😢",
  [ReactionType.Angry]: "😠",
  [ReactionType.Care]: "🤗",
  [ReactionType.Support]: "💪",
  [ReactionType.Celebrate]: "🎉"
};

export const getReactionEmoji = (reactionType: string): string => {
  const enumValue = Object.entries(ReactionType)
    .find(([key]) => key.toLowerCase() === reactionType.toLowerCase())?.[1];
  
  return enumValue !== undefined ? reactionEmojis[enumValue as ReactionType] : "👍";
};

export const getReactionTypeFromString = (reactionType: string): number => {
  const enumValue = Object.entries(ReactionType)
    .find(([key]) => key.toLowerCase() === reactionType.toLowerCase())?.[1];
  
  return enumValue !== undefined ? enumValue as number : 0;
};