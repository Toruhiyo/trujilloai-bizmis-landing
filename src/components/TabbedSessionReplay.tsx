import React, { useState } from "react";
import { Gift, MessageCircle, DollarSign, User } from "lucide-react";
import SessionReplayCard from "./SessionReplayCard";
import { giftScenarioSessionReplayData } from "../data/benefit-3-sessionreplay-1-conversation";
import { customerSupportPolicySessionReplayData } from "../data/benefit-3-sessionreplay-2-support";
import { SessionReplayData } from "../data/benefit-3-sessionreplay-1-conversation";

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
      data: giftScenarioSessionReplayData,
    },
    {
      id: "support",
      data: customerSupportPolicySessionReplayData,
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.data.title}</span>
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
