import { Sparkles, Heart, Zap, Bot, Brain, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Meet Maya",
      subtitle: "Your Sales Superstar",
      description: "A charming 3D avatar who knows your products inside out and guides customers to their perfect match with a warm, friendly personality.",
      stats: "97% customer satisfaction",
      color: "bg-gradient-to-br from-pink-400 via-rose-300 to-orange-300"
    },
    {
      icon: Heart,
      title: "Meet Alex",
      subtitle: "Support Champion",
      description: "Your compassionate support specialist who handles every query with empathy, turning frustrated customers into loyal fans.",
      stats: "15 sec avg response time",
      color: "bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-300"
    },
    {
      icon: Brain,
      title: "Meet Sam",
      subtitle: "Analytics Wizard",
      description: "The smartest member of your team who reveals hidden insights about customer behavior and helps optimize your store performance.",
      stats: "35% avg conversion boost",
      color: "bg-gradient-to-br from-purple-400 via-violet-300 to-indigo-300"
    }
  ];

  const capabilities = [
    { icon: Bot, title: "Natural Conversations", desc: "Human-like interactions that feel genuine" },
    { icon: Zap, title: "Lightning Fast", desc: "Instant responses, zero wait time" },
    { icon: Shield, title: "Always Learning", desc: "Gets smarter with every interaction" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Large decorative elements */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Avatar placeholder images scattered around */}
      <div className="absolute top-16 left-16 w-32 h-24 bg-gradient-to-r from-pink-200 to-rose-200 rounded-2xl border-2 border-dashed border-pink-300 flex items-center justify-center shadow-lg rotate-12">
        <span className="text-sm font-medium text-pink-700">Maya Avatar Image</span>
      </div>
      <div className="absolute top-40 right-20 w-28 h-20 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center shadow-lg -rotate-6">
        <span className="text-xs font-medium text-blue-700">Alex Avatar</span>
      </div>
      <div className="absolute bottom-32 left-20 w-30 h-22 bg-gradient-to-r from-purple-200 to-violet-200 rounded-2xl border-2 border-dashed border-purple-300 flex items-center justify-center shadow-lg rotate-6">
        <span className="text-xs font-medium text-purple-700">Sam Avatar</span>
      </div>
      
      {/* Floating UI mockups */}
      <div className="absolute top-60 right-8 w-40 h-28 bg-white rounded-xl shadow-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        <div className="w-8 h-8 bg-pink-400 rounded-full mb-2"></div>
        <span className="text-xs text-gray-600">Chat Interface</span>
      </div>
      <div className="absolute bottom-60 right-16 w-36 h-24 bg-white rounded-xl shadow-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        <div className="w-6 h-6 bg-blue-400 rounded mb-1"></div>
        <span className="text-xs text-gray-600">Analytics Panel</span>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Meet Your AI Dream Team
          </div>
          <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Three AI Personalities,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Infinite Possibilities
            </span>
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-4xl mx-auto leading-relaxed">
            Each AI assistant has their own unique personality, expertise, and charm. Together, they create the most comprehensive customer experience your store has ever had.
          </p>
        </div>
        
        {/* Main feature cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Background card */}
              <div className={`${feature.color} rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl`}>
                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <feature.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground font-body leading-relaxed mb-6 flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className="bg-accent/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-accent mb-1">{feature.stats}</div>
                    <div className="text-xs text-muted-foreground font-medium">Performance metric</div>
                  </div>
                </div>
              </div>
              
              {/* Avatar placeholder positioned on card */}
              <div className="absolute -top-4 -right-4 w-20 h-16 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shadow-lg">
                <span className="text-xs font-medium text-gray-600">3D Avatar</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Capabilities section */}
        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-12">
          <h3 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Built for the Modern Store
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