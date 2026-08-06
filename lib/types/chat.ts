export interface ChatParticipant {
  userId: string;
  email: string;
  accountType?: string;
  name?: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  createdAt: string;
}

export interface ChatAttachment {
  url: string;
  publicId: string;
  name: string;
  size: number;
  type: string;
}

export interface SendMessageInput {
  body?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
}

export interface ChatMessagesData {
  items: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatLastMessage {
  id?: string;
  body?: string;
  senderId?: string;
  createdAt?: string;
}

export interface ChatConversationSummary {
  id: string;
  jobId?: string;
  jobTitle?: string;
  participant: ChatParticipant;
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversationsData {
  items: ChatConversationSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatConversation {
  id: string;
  jobId?: string;
  jobTitle?: string;
  participants: ChatParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatUnreadCount {
  total: number;
}

export interface CreateConversationInput {
  participantIds?: string[];
  participantEmails?: string[];
  jobId?: string;
}

export interface SearchPeopleItem {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accountType: string;
}

export interface SearchPeopleData {
  items: SearchPeopleItem[];
}
