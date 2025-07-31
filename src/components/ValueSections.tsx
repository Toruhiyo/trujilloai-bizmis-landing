import { ShoppingCart, MessageCircle, BarChart3 } from "lucide-react";

const ValueSections = () => {
  return (
    <div className="space-y-20">
      {/* Sell More, Effortlessly */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Sell More, Effortlessly
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Your digital salesperson greets every visitor with a warm welcome, 
                asks the right questions, and guides them to products they'll love. 
                Just like your best store clerk would—helping customers discover exactly 
                what they need and confidently move to checkout.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  Guided discovery • Product comparisons • Cart assistance
                </div>
              </div>
            </div>
            <div className="bg-gradient-subtle rounded-3xl p-8 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4" />
                <p className="font-body">Visual placeholder for sales illustration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Always-On Customer Support */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white rounded-3xl p-8 flex items-center justify-center lg:order-1">
              <div className="text-center text-muted-foreground">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full mx-auto mb-4" />
                <p className="font-body">Visual placeholder for support illustration</p>
              </div>
            </div>
            <div className="space-y-6 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Always-On Customer Support
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Questions about sizing? Wondering about return policies? Your digital 
                salesperson responds instantly with helpful, human-feeling answers. 
                No waiting, no frustration—just the kind of attentive service that 
                turns browsers into loyal customers.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  Instant responses • Product clarifications • Decision support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smarter Store Decisions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Smarter Store Decisions
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Watch real customer interactions unfold through session replays, 
                tag meaningful conversations, and spot patterns in your dashboard. 
                See exactly how customers navigate your store and what drives them 
                to buy—insights that help you optimize every part of the experience.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  Session replays • Conversation tagging • Insights dashboard
                </div>
              </div>
            </div>
            <div className="bg-gradient-subtle rounded-3xl p-8 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-24 h-24 bg-purple-500/20 rounded-full mx-auto mb-4" />
                <p className="font-body">Visual placeholder for analytics illustration</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValueSections;