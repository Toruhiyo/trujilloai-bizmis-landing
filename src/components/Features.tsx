import { ShoppingCart, MessageCircle, TrendingUp } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Boost Sales Conversion",
      description: "Personalized shopping experience with custom avatars that guide customers to the perfect products.",
      benefits: ["Custom voice & appearance", "Product recommendations", "Cart optimization"],
      color: "from-green-400 to-green-600"
    },
    {
      icon: MessageCircle,
      title: "24/7 Customer Support",
      description: "Instant human-like assistance that never sleeps, handling queries and complaints with warmth.",
      benefits: ["Instant responses", "Human-like conversations", "Issue resolution"],
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Deep insights into customer behavior with session replays and tagged conversations.",
      benefits: ["Session recordings", "Conversation analytics", "Growth insights"],
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      {/* Background Avatar Placeholders */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" 
           title="Placeholder for cute 3D avatar - Feature showcase avatar 1" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500" 
           title="Placeholder for cute 3D avatar - Feature showcase avatar 2" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/8 rounded-full blur-lg animate-pulse delay-1000" 
           title="Placeholder for cute 3D avatar - Feature showcase avatar 3" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Your AI Store Assistant Does It All
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Just like having the best sales team in your physical store, but available 24/7 for your online customers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-brand transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Special floating bubbles for sales and support */}
              {index === 0 && (
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce z-20">
                  <div className="text-lg font-bold text-primary font-heading">+47%</div>
                  <div className="text-xs text-gray-600 font-body">Sales Increase</div>
                </div>
              )}
              {index === 1 && (
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
                  <div className="text-lg font-bold text-primary font-heading">24/7</div>
                  <div className="text-xs text-gray-600 font-body">AI Support</div>
                </div>
              )}
              {index === 2 && (
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary/10 rounded-full blur-sm animate-pulse delay-700" 
                     title="Placeholder for cute 3D avatar - Analytics character" />
              )}
              
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span className="text-sm font-medium font-body">{benefit}</span>
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

export default Features;