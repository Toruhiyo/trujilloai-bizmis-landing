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
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Voice & appearance customization to match your brand</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Personalized product suggestions</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Product comparisons and guidance</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Smart cart assistance</span>
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
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full mr-3" />
                  <span className="font-body">Instant answers day and night</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full mr-3" />
                  <span className="font-body">Conversational tone with empathy</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full mr-3" />
                  <span className="font-body">Complete product knowledge</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full mr-3" />
                  <span className="font-body">Support throughout the buying process</span>
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
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Complete session replays</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Tagged conversations for analysis</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Comprehensive insights dashboard</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <span className="font-body">Customer behavior analytics</span>
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