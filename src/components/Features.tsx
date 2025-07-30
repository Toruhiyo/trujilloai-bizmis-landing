import { ShoppingCart, MessageCircle, TrendingUp, Sparkles, Zap, Brain } from "lucide-react";

const Features = () => {
  const services = [
    {
      icon: ShoppingCart,
      title: "Sales Assistant",
      description: "Your AI avatar becomes the perfect sales person, guiding customers through products with personalized recommendations and helping them find exactly what they need.",
      stats: "97% customer satisfaction",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "Customer Support",
      description: "Handle queries, complaints, and support requests with warmth and intelligence. Your AI never gets tired and always maintains a helpful, friendly tone.",
      stats: "15 sec avg response time", 
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics Expert",
      description: "Deep insights into customer behavior with session replays, conversation analytics, and actionable data to boost your store's performance.",
      stats: "35% avg conversion boost",
      color: "from-purple-400 to-violet-500"
    }
  ];

  const capabilities = [
    { icon: Sparkles, title: "Natural Voice Chat", desc: "Human-like conversations that feel genuine" },
    { icon: Zap, title: "Lightning Fast", desc: "Instant responses, zero wait time" },
    { icon: Brain, title: "Always Learning", desc: "Gets smarter with every interaction" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Large decorative elements */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Main AI avatar placeholder - centered */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-40 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl border-2 border-dashed border-primary/30 flex items-center justify-center shadow-xl">
        <span className="text-lg font-bold text-primary">Main AI Avatar</span>
      </div>
      
      {/* Service illustration placeholders */}
      <div className="absolute top-40 left-16 w-32 h-24 bg-gradient-to-r from-green-200 to-emerald-200 rounded-2xl border-2 border-dashed border-green-300 flex items-center justify-center shadow-lg rotate-12">
        <span className="text-sm font-medium text-green-700">Sales Mode</span>
      </div>
      <div className="absolute top-60 right-20 w-28 h-20 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center shadow-lg -rotate-6">
        <span className="text-xs font-medium text-blue-700">Support Mode</span>
      </div>
      <div className="absolute bottom-32 left-20 w-30 h-22 bg-gradient-to-r from-purple-200 to-violet-200 rounded-2xl border-2 border-dashed border-purple-300 flex items-center justify-center shadow-lg rotate-6">
        <span className="text-xs font-medium text-purple-700">Analytics Mode</span>
      </div>
      
      {/* Chat interface mockup */}
      <div className="absolute bottom-60 right-16 w-36 h-24 bg-white rounded-xl shadow-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        <div className="w-6 h-6 bg-primary rounded-full mb-1"></div>
        <span className="text-xs text-gray-600">Voice Chat UI</span>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            One AI, Three Superpowers
          </div>
          <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Your AI Assistant
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Wears Many Hats
            </span>
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-4xl mx-auto leading-relaxed">
            Meet your new AI teammate - a single intelligent avatar that seamlessly switches between sales expert, support specialist, and analytics guru based on what your customers need.
          </p>
        </div>
        
        {/* Main service cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group relative"
            >
              <div className={`bg-gradient-to-br ${service.color} rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl`}>
                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <service.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground">
                      {service.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground font-body leading-relaxed mb-6 flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="bg-accent/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-accent mb-1">{service.stats}</div>
                    <div className="text-xs text-muted-foreground font-medium">Performance metric</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Capabilities section */}
        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-12">
          <h3 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Powered by Advanced AI Technology
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((cap, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <cap.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {cap.title}
                </h4>
                <p className="text-muted-foreground font-body">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;