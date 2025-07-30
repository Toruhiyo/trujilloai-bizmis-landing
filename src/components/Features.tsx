import { ShoppingCart, MessageCircle, TrendingUp, Cpu, Zap, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: ShoppingCart,
      secondaryIcon: Zap,
      title: "3D Sales Assistant",
      description: "Interactive 3D avatars that engage customers with personalized shopping experiences and real-time product recommendations.",
      benefits: ["AI-powered interactions", "3D product visualization", "Smart upselling algorithms"],
      color: "text-primary",
      glowColor: "shadow-neon"
    },
    {
      icon: MessageCircle,
      secondaryIcon: Cpu,
      title: "Immersive Support Bot",
      description: "Floating support assistants that provide instant help through natural conversations and spatial interfaces.",
      benefits: ["24/7 availability", "Context-aware responses", "Multi-dimensional help"],
      color: "text-secondary",
      glowColor: "shadow-soft"
    },
    {
      icon: TrendingUp,
      secondaryIcon: Eye,
      title: "Holographic Analytics",
      description: "Visualize customer data in 3D space with interactive charts and real-time behavioral insights.",
      benefits: ["3D data visualization", "Predictive analytics", "Spatial heat maps"],
      color: "text-accent",
      glowColor: "shadow-card"
    }
  ];

  return (
    <section className="py-20 particle-bg relative overflow-hidden">
      {/* Floating 3D Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl floating-3d" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary/20 rounded-full blur-xl floating-3d" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/20 rounded-full blur-lg floating-3d" />
      
      <div className="container mx-auto px-6 relative z-20">
        <div className="text-center mb-16 parallax-layer" 
             style={{ transform: `translateY(${mousePosition.y * 0.01}px)` }}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 glow-text">
            Experience the <span className="bg-gradient-neon bg-clip-text text-transparent">Future</span> of AI Commerce
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Step into a new dimension where AI assistants exist in 3D space, providing immersive and intelligent customer experiences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-card/30 backdrop-blur-md rounded-3xl p-8 neon-border transition-all duration-500 hover:scale-105 relative overflow-hidden"
              style={{ 
                transform: `translateX(${mousePosition.x * (index - 1) * 0.01}px) translateY(${mousePosition.y * 0.005}px)` 
              }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color.replace('text-', 'from-')}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Floating icon container */}
              <div className="relative z-10 mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-neon flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 ${feature.glowColor}`}>
                  <feature.icon className="w-10 h-10 text-background" />
                </div>
                
                {/* Secondary floating icon */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center ${feature.color} floating-3d`}>
                  <feature.secondaryIcon className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className={`text-2xl font-heading font-bold mb-4 ${feature.color} glow-text`}>
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <div className={`w-2 h-2 rounded-full mr-3 ${feature.color.replace('text-', 'bg-')} animate-pulse`} />
                    <span className="text-sm font-medium font-body">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              {/* Interactive hover effect */}
              {hoveredFeature === index && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 text-6xl opacity-20 floating-3d">
                    {index === 0 && "🛒"}
                    {index === 1 && "🎧"}
                    {index === 2 && "📊"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;