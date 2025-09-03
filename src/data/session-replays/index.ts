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

export interface SessionReplayData {
  // Audio configuration
  audioUrl: string;
  totalDurationSeconds: number;
  
  // Session metadata
  language: string;
  duration: string;
  messageCount: string;
  
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
export { supportPolicyQuestionSessionReplayData } from "./support-policy-question";

