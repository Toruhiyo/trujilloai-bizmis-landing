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

const TAB_TOOLTIPS: Record<string, string> = {
  sale: "Anonymous user sale session — gift search leading to purchase",
  "sale-loyal": "Logged-in user sale session — returning customer purchase",
  "support-success": "Support session — policy question resolved successfully",
  "support-failed": "Support session — request not completed",
};

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
    <div className={`w-full min-w-0 max-w-2xl ${className}`}>
      {/* Tab Navigation — horizontal swipe strip on phones (no wrap, snap),
          falls back to the original wrap layout from sm+.
          py-2 on mobile gives the active pill's halo room to render within
          the scroll box (overflow-x-auto implicitly clamps overflow-y). */}
      <div className="flex flex-nowrap sm:flex-wrap items-center justify-start gap-1.5 sm:gap-2 mb-4 sm:mb-6 px-1 py-2 sm:py-0 overflow-x-auto sm:overflow-visible no-scrollbar snap-x snap-mandatory">
        {tabs.map((tab) => {
          const IconComponent = getCategoryIcon(tab.data.category);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              title={TAB_TOOLTIPS[tab.id] ?? ""}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 sm:shrink snap-center relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-transparent text-primary"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={
                isActive
                  ? {
                      boxShadow:
                        "0 0 0 1px rgba(253, 145, 42, 0.3), 0 0 20px rgba(253, 145, 42, 0.2), 0 0 40px rgba(253, 145, 42, 0.12)",
                    }
                  : undefined
              }
            >
              {/* Logged-in customer badge overlay */}
              {tab.data.customer.name && (
                <div
                  className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-background flex items-center justify-center ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-muted-foreground/60 text-white"
                  }`}
                >
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              )}

              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{tab.data.category}</span>

              {tab.data.success ? (
                <svg
                  className={`w-3 h-3 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
                  className={`w-3 h-3 shrink-0 ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}
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
