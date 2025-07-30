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
      {/* Background Avatar Placeholders - Responsive */}
      <div className="absolute top-10 left-4 lg:left-10 w-20 lg:w-24 h-20 lg:h-24 bg-primary/10 rounded-full blur-xl animate-pulse" 
           title="Placeholder for cute 3D avatar - Feature showcase avatar 1" />
      <div className="absolute bottom-10 right-4 lg:right-10 w-24 lg:w-32 h-24 lg:h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500" 
           title="Placeholder for cute 3D avatar - Feature showcase avatar 2" />
      
      {/* Descriptive Avatar Placeholders - Responsive */}
      <div className="absolute top-32 right-4 lg:right-20 w-24 lg:w-32 h-16 lg:h-20 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
        <span className="text-xs text-gray-600 font-body text-center px-1 lg:px-2">Cute 3D Sales Avatar</span>
      </div>
      <div className="absolute bottom-32 left-4 lg:left-20 w-24 lg:w-32 h-16 lg:h-20 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
        <span className="text-xs text-gray-600 font-body text-center px-1 lg:px-2">Support Assistant Avatar</span>
      </div>
      
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
              {/* Avatar placeholder for analytics section only - Responsive */}
              {index === 2 && (
                <div className="absolute -bottom-4 lg:-bottom-6 -right-4 lg:-right-6 w-24 lg:w-28 h-14 lg:h-16 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-body text-center px-1 lg:px-2">Analytics Expert Avatar</span>
                </div>
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