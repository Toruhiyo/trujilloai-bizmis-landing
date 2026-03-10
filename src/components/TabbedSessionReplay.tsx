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
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const IconComponent = getCategoryIcon(tab.data.category);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-transparent text-[#FD912A]"
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
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
                    isActive
                      ? "bg-[#FD912A] text-white"
                      : "bg-muted-foreground/60 text-white"
                  }`}
                >
                  <User className="w-3 h-3" />
                </div>
              )}

              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{tab.data.category}</span>

              {tab.data.success ? (
                <svg
                  className={`w-3 h-3 shrink-0 ${isActive ? "text-[#FD912A]" : "text-muted-foreground"}`}
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
