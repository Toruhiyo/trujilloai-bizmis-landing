import { MessageCircle, Clock, Heart, Headphones, Shield } from "lucide-react";

const CustomerSupport = () => {
  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Visual Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="w-24 h-24 text-blue-500 mx-auto" />
                <div className="space-y-2">
                  <div className="text-2xl font-heading font-bold text-blue-700">
                    Icon of chat bubble
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                24/7 Human-Feel Support
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Questions answered instantly, any hour, in a voice that feels
                genuinely helpful.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Always online, never waiting
                  </h3>
                  <p className="text-muted-foreground font-body">
                    No waiting times, no business hours — your assistant is
                    ready to help customers whenever they need it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Warm, conversational replies
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Responds with genuine warmth and understanding, making
                    customers feel heard and valued.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Headphones className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Deep product know-how
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Deep knowledge of your catalog to answer detailed questions
                    and provide expert recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Reassurance during checkout
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Guides customers through concerns, comparisons, and
                    decision-making with patience and expertise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSupport;
