import { ShoppingCart, MessageCircle, BarChart3, Check } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Turns browsing into buying",
    description: "Bizmis welcomes visitors and helps them find what they need, fast.",
    benefits: [
      "Guides users through your product catalog in natural conversation",
      "Highlights the right products based on needs and preferences", 
      "Adds products to cart directly during chat"
    ],
    color: "from-green-500/20 to-green-600/20 border-green-400/30"
  },
  {
    icon: MessageCircle,
    title: "Support that shows up — every time",
    description: "Customers get instant answers with a natural, human-feeling touch.",
    benefits: [
      "Handles questions, hesitations, and issues 24/7",
      "Works fluently across product info, shipping, and policies",
      "Builds trust through smooth, voice-based service"
    ],
    color: "from-blue-500/20 to-blue-600/20 border-blue-400/30"
  },
  {
    icon: BarChart3,
    title: "Understands your store like a pro",
    description: "Bizmis brings insights from every chat to improve your store's performance.",
    benefits: [
      "Conversation tagging and session replays",
      "Discover what people want (and what blocks them)",
      "Actionable reports for smarter decisions"
    ],
    color: "from-purple-500/20 to-purple-600/20 border-purple-400/30"
  }
];

const BizmisFeatures = () => {
  return (
    <section className="py-20" style={{ background: "var(--bizmis-soft)" }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
            Sales Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three ways Bizmis transforms your store into a personal shopping experience
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-2xl p-8 hover:scale-105 transition-transform duration-300`}
              >
                <div className="mb-6">
                  <div className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 font-medium">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BizmisFeatures;