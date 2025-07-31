import { TrendingUp, Clock, BarChart3 } from "lucide-react";

const ValueSections = () => {
  return (
    <>
      {/* Section 1: Increase Sales Conversion */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Increase Sales Conversion
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Your assistant welcomes every visitor and actively guides them to the right products — just like a skilled store clerk. It offers personalized suggestions, helps compare options, and assists with cart decisions, creating the personal shopping experience that turns browsers into buyers.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Voice & Appearance Customization</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Match your brand perfectly</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Personalized Product Suggestions</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Smart recommendations based on preferences</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Product Comparisons & Guidance</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Help customers make informed decisions</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Smart Cart Assistance</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Reduce cart abandonment with guidance</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center">
                <TrendingUp className="w-24 h-24 text-primary" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 24/7 Customer Support */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative lg:order-1">
              <div className="aspect-square bg-gradient-to-br from-accent/30 to-accent/10 rounded-3xl flex items-center justify-center">
                <Clock className="w-24 h-24 text-accent-foreground" />
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent/30 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
            </div>
            <div className="space-y-6 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                24/7 Customer Support with a Human Touch
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Your customers get instant, empathetic support anytime they need it. Your assistant handles product questions, provides buying guidance, and offers the kind of warm, helpful service that builds customer loyalty — even at 3 AM.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-accent-foreground rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Instant Answers Day & Night</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">24/7 availability for customer questions</p>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-accent-foreground rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Conversational Tone with Empathy</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Human-like interactions that build trust</p>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-accent-foreground rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Complete Product Knowledge</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Expert-level information on every item</p>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-accent-foreground rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Support Throughout Buying Process</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">From discovery to checkout completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Understand and Improve Your Store */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Understand and Improve Your Store
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                See exactly how customers interact with your store. Watch session replays, review tagged conversations, and get insights that help you make smarter business decisions. Your assistant learns what works and helps you understand your customers better than ever.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Complete Session Replays</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Watch exactly how customers navigate</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Tagged Conversations</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Organize insights for easy analysis</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Comprehensive Insights Dashboard</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">All your analytics in one place</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-body font-semibold text-foreground">Customer Behavior Analytics</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">Understand patterns and preferences</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center">
                <BarChart3 className="w-24 h-24 text-primary" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ValueSections;