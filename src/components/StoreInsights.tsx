import { TrendingUp, Play, Tag, BarChart3, Eye, Users } from "lucide-react";

const StoreInsights = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Understand and Improve Your Store
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Get clear insights into what customers do and say, helping you
                refine your store experience and make smarter business
                decisions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Play className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Session Replays
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Watch how customers navigate and interact with your
                    assistant to identify improvement opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Tag className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Tagged Conversations
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Automatically categorized customer interactions reveal
                    common questions and pain points.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Interaction Dashboard
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Clear analytics showing customer behavior trends, popular
                    products, and conversion patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <TrendingUp className="w-24 h-24 text-purple-500 mx-auto" />
                <div className="space-y-2">
                  <div className="text-2xl font-heading font-bold text-purple-700">
                    Deep Insights
                  </div>
                  <div className="text-purple-600 font-body">
                    Customer Behavior Analytics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreInsights;
