import { ShoppingCart, MessageCircle, BarChart3 } from "lucide-react";

const BizmisFeatures = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Turns browsing into buying",
      description: "Your salesperson welcomes visitors and helps them find what they need, fast.",
      benefits: [
        "Guides users through your product catalog in natural conversation",
        "Highlights the right products based on needs and preferences", 
        "Adds products to cart directly during chat"
      ],
      color: "from-green-400 to-green-600"
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
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Understands your store like a pro",
      description: "Our assistant brings insights from every chat to improve your store's performance.",
      benefits: [
        "Conversation tagging and session replays",
        "Discover what people want (and what blocks them)",
        "Actionable reports for smarter decisions"
      ],
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-4 lg:left-10 w-20 lg:w-24 h-20 lg:h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-4 lg:right-10 w-24 lg:w-32 h-24 lg:h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Sales Made Simple
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Just like having your best salesperson in every customer interaction — but available whenever your store is open.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-brand transition-all duration-300 hover:-translate-y-2 relative"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground font-body mb-6 leading-relaxed text-lg">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span className="text-sm font-medium font-body leading-relaxed">{benefit}</span>
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