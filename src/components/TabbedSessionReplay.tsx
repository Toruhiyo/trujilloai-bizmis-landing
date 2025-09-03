import React, { useState } from "react";
import { Gift, MessageCircle, DollarSign, User } from "lucide-react";
import SessionReplayCard from "./SessionReplayCard";
import {
  saleGiftSessionReplayData,
  saleLoyalCustomerSessionReplayData,
  supportPolicyQuestionSessionReplayData,
  supportFailedRequestSessionReplayData,
  SessionReplayData,
} from "../data/session-replays";

interface TabOption {
  id: string;
  data: SessionReplayData;
}

interface TabbedSessionReplayProps {
  className?: string;
}

const TabbedSessionReplay: React.FC<TabbedSessionReplayProps> = ({
  className = "",
}) => {
  const tabs: TabOption[] = [
    {
      id: "sale",
      data: saleGiftSessionReplayData,
    },
    {
      id: "sale-loyal",
      data: saleLoyalCustomerSessionReplayData,
    },
    {
      id: "support-success",
      data: supportPolicyQuestionSessionReplayData,
    },
    {
      id: "support-failed",
      data: supportFailedRequestSessionReplayData,
    },
  ];

  // Function to get icon based on category
  const getCategoryIcon = (category: string) => {
    return category === "Sale" ? DollarSign : MessageCircle;
  };

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const currentData =
    tabs.find((tab) => tab.id === activeTab)?.data || tabs[0].data;

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-muted/30 rounded-xl">
        {tabs.map((tab) => {
          const IconComponent = getCategoryIcon(tab.data.category);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {/* Logged-in customer badge overlay */}
              {tab.data.customer.name && (
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
                    activeTab === tab.id
                      ? "bg-primary text-background"
                      : "bg-muted-foreground text-background"
                  }`}
                >
                  <User className="w-3 h-3" />
                </div>
              )}

              <IconComponent className="w-4 h-4" />
              <span>{tab.data.category}</span>

              {tab.data.success ? (
                <svg
                  className={`w-3 h-3 ${
                    activeTab === tab.id ? "text-primary" : "text-primary/70"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-3 h-3 ${
                    activeTab === tab.id
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Session Replay Card */}
      <SessionReplayCard sessionData={currentData} />
    </div>
  );
};

export default TabbedSessionReplay;
