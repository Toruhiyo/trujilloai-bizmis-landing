// Session replay types and data exports
export interface ConversationBubble {
  id: string;
  time: string;
  position: number;
  type: "customer" | "agent" | "event";
  content: string;
  delay: number;
}

export interface ConversationMark {
  time: number; // seconds
  type: "customer" | "agent" | "event";
  label: string;
}

export interface CustomerInfo {
  name: string | null; // null for anonymous
  avatar?: string; // optional custom avatar path
  isLoyal?: boolean; // indicates if this is a loyal customer
}

export interface SessionReplayData {
  // Audio configuration
  audioUrl: string;
  totalDurationSeconds: number;

  // Session metadata
  date: Date;
  language: string;
  durationSeconds: number; // duration in seconds instead of string
  messageCount: number; // actual count instead of string

  // Customer information
  customer: CustomerInfo;

  // Example information
  title: string;
  category: "Sale" | "Support";
  success: boolean;

  // Conversation data
  conversationMarks: ConversationMark[];
  conversations: ConversationBubble[];
}

// Export all session replay data
export { saleGiftSessionReplayData } from "./sale-gift";
export { saleLoyalCustomerSessionReplayData } from "./sale-loyal-customer";
export { supportPolicyQuestionSessionReplayData } from "./support-policy-question";
export { supportFailedRequestSessionReplayData } from "./support-failed-request";
