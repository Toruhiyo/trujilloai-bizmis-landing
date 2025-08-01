import {
  ShoppingCart,
  Users,
  MessageSquare,
  ShoppingBag,
  Sparkles,
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
                Your assistant welcomes visitors and helps them find exactly
                what they need — like a real store clerk who knows your products
                inside and out.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Voice Cloning & Visual Customization
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Your assistant sounds and looks like you, creating genuine
                    connections that build trust with customers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Personalized Product Suggestions
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Smart recommendations that feel natural, helping customers
                    discover products they'll love.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Product Comparison & Navigation
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Conversational guidance through your catalog with detailed
                    descriptions and helpful comparisons.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    Cart Handling
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Seamlessly helps customers through the entire buying
                    process, from discovery to checkout completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <ShoppingCart className="w-24 h-24 text-green-500 mx-auto" />
                <div className="space-y-2">
                  <div className="text-2xl font-heading font-bold text-green-700">
                    +47%
                  </div>
                  <div className="text-green-600 font-body">
                    Average Conversion Increase
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
