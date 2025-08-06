import {
  ShoppingCart,
  Users,
  MessageSquare,
  ShoppingBag,
  ArrowUp,
} from "lucide-react";

const SalesConversion = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Increase Sales Conversion
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                Shoppers feel personally guided—finding the right product fast
                and checking out with confidence.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Voice & look that match you
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Your assistant sounds and looks like you, creating genuine
                    connections that build trust.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Tailored product picks
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Smart recommendations that feel natural, helping customers
                    discover products they'll love.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Side-by-side comparisons
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Conversational guidance through your catalog with detailed
                    descriptions and helpful comparisons.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Smooth cart help
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Seamlessly guides customers through the entire buying
                    process, from discovery to checkout completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <ShoppingCart className="w-24 h-24 text-orange-600 mx-auto" />
                  <ArrowUp className="w-8 h-8 text-orange-600 absolute -top-2 -right-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-heading font-bold text-orange-700">
                    Icon of cart + arrow up
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

export default SalesConversion;
