import { ShoppingCart, MessageCircle, TrendingUp } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Sales Superstar",
      description: "Meet Alex, your charming sales assistant who guides customers with personality and converts browsers into buyers.",
      benefits: ["Personalized product tours", "Smart upselling", "Cart rescue missions"],
      avatar: "Alex",
      color: "from-accent-blue to-blue-400",
      bgColor: "accent-blue"
    },
    {
      icon: MessageCircle,
      title: "Support Angel",
      description: "Say hello to Maya, your 24/7 support companion who solves problems with a smile and never gets tired.",
      benefits: ["Instant problem solving", "Empathetic responses", "Escalation when needed"],
      avatar: "Maya",
      color: "from-accent-pink to-pink-400",
      bgColor: "accent-pink"
    },
    {
      icon: TrendingUp,
      title: "Analytics Wizard",
      description: "Meet Sam, your data detective who uncovers insights and presents them in beautiful, easy-to-understand visualizations.",
      benefits: ["Customer journey maps", "Behavior insights", "Growth recommendations"],
      avatar: "Sam",
      color: "from-accent-green to-green-400",
      bgColor: "accent-green"
    }
  ];

  return (
    <section className="py-24 bg-gradient-cloud relative overflow-hidden">
      {/* Whimsical floating elements */}
      <div className="absolute top-16 left-8 w-32 h-24 bg-white/30 rounded-full blur-xl animate-pulse opacity-60" />
      <div className="absolute bottom-20 right-12 w-28 h-20 bg-white/20 rounded-full blur-xl animate-pulse opacity-50 delay-300" />
      <div className="absolute top-1/2 left-1/4 w-20 h-16 bg-white/25 rounded-full blur-lg animate-pulse opacity-40 delay-700" />
      
      {/* Illustrated landscape elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-100/50 to-transparent" 
           title="Placeholder: Rolling hills with scattered 3D avatars" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            Meet Your
            <span className="block text-primary">Dream Team</span>
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Each AI assistant has their own personality, specialty, and cute 3D appearance. 
            They work together to create magical customer experiences.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Floating card with avatar */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-float hover:shadow-glow transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                {/* Background pattern */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl`} />
                
                {/* Avatar illustration placeholder */}
                <div className="text-center mb-6">
                  <div className={`w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full mx-auto mb-4 border-4 border-white shadow-float relative`}>
                    <div className="absolute inset-2 bg-white/20 rounded-full" />
                    <div className="absolute inset-4 bg-white/30 rounded-full flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-lg font-heading font-bold text-foreground">{feature.avatar}</div>
                  <div className="text-sm text-muted-foreground">{feature.title}</div>
                </div>
                
                {/* Illustration placeholder */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 mb-6 min-h-[120px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {feature.avatar} in Action
                    </div>
                    <div className="text-xs text-gray-500 max-w-[200px]">
                      Cute 3D scene showing {feature.avatar} helping customers
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-muted-foreground">
                      <div className={`w-2 h-2 bg-${feature.bgColor} rounded-full mr-3 animate-pulse`} style={{animationDelay: `${idx * 200}ms`}} />
                      <span className="text-sm font-medium font-body">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Floating elements around each card */}
              {index === 0 && (
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent-blue/20 rounded-full animate-bounce" 
                     title="Floating sales icon" />
              )}
              {index === 1 && (
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-accent-pink/20 rounded-full animate-bounce delay-200" 
                     title="Floating support icon" />
              )}
              {index === 2 && (
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-accent-green/20 rounded-full animate-bounce delay-400" 
                     title="Floating analytics icon" />
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom illustration placeholder */}
        <div className="mt-20 text-center">
          <div className="bg-white/20 border-2 border-dashed border-primary/30 rounded-3xl p-12 backdrop-blur-sm">
            <div className="text-lg font-heading font-semibold text-primary mb-4">
              Team Collaboration Scene
            </div>
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              Illustration showing all three avatars working together in a whimsical store environment, 
              with floating UI elements and happy customers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;