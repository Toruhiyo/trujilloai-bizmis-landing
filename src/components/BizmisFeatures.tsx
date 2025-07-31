import { ShoppingCart, MessageCircle, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Sales Made Simple",
    subtitle: "Turns browsing into buying",
    description: "Bizmis welcomes visitors and helps them find what they need, fast.",
    benefits: [
      "Guides users through your product catalog in natural conversation",
      "Highlights the right products based on needs and preferences", 
      "Adds products to cart directly during chat"
    ],
    color: "text-primary"
  },
  {
    icon: MessageCircle,
    title: "Always There for Them",
    subtitle: "Support that shows up — every time",
    description: "Customers get instant answers with a natural, human-feeling touch.",
    benefits: [
      "Handles questions, hesitations, and issues 24/7",
      "Works fluently across product info, shipping, and policies",
      "Builds trust through smooth, voice-based service"
    ],
    color: "text-primary-dark"
  },
  {
    icon: BarChart3,
    title: "Knows What Works", 
    subtitle: "Understands your store like a pro",
    description: "Bizmis brings insights from every chat to improve your store's performance.",
    benefits: [
      "Conversation tagging and session replays",
      "Discover what people want (and what blocks them)",
      "Actionable reports for smarter decisions"
    ],
    color: "text-primary-light"
  }
];

const BizmisFeatures = () => {
  return (
    <section className="py-20 bg-gradient-subtle relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="space-y-6">
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <h4 className="text-lg font-medium text-primary">
                    {feature.subtitle}
                  </h4>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BizmisFeatures;