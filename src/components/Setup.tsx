import { Button } from "@/components/ui/button";
import { Rocket, Code2, Smartphone, Download, Globe, CheckCircle, Clock, Users } from "lucide-react";

const Setup = () => {
  const setupSteps = [
    {
      number: "01",
      title: "Choose Your Platform",
      description: "Whether it's Shopify, WooCommerce, or a custom build - we support them all.",
      icon: Globe,
      time: "2 mins"
    },
    {
      number: "02", 
      title: "Customize Your Avatars",
      description: "Pick personalities, voices, and appearance for Maya, Alex, and Sam.",
      icon: Users,
      time: "5 mins"
    },
    {
      number: "03",
      title: "Go Live",
      description: "One-click deployment. Your AI team is ready to serve customers instantly.",
      icon: Rocket,
      time: "1 min"
    }
  ];

  const platforms = [
    {
      name: "Shopify",
      description: "Install directly from the App Store with zero technical setup required.",
      icon: Download,
      features: ["One-click install", "Auto product sync", "Pre-built templates"],
      buttonText: "Install from App Store",
      buttonVariant: "default" as const,
      bgColor: "from-green-400/20 to-emerald-400/20",
      iconColor: "text-green-600"
    },
    {
      name: "Custom Website",
      description: "Seamless integration for any platform with our flexible API and SDKs.",
      icon: Code2,
      features: ["Custom integration", "Full API access", "White-label options"],
      buttonText: "Get Integration Guide",
      buttonVariant: "outline" as const,
      bgColor: "from-blue-400/20 to-purple-400/20",
      iconColor: "text-blue-600"
    },
    {
      name: "Mobile App",
      description: "Native mobile SDKs for iOS and Android with full avatar support.",
      icon: Smartphone,
      features: ["Native SDKs", "Offline fallback", "Push notifications"],
      buttonText: "Download SDK",
      buttonVariant: "outline" as const,
      bgColor: "from-purple-400/20 to-pink-400/20",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Floating setup mockups */}
      <div className="absolute top-20 left-10 w-40 h-32 bg-white rounded-2xl shadow-xl border-2 border-dashed border-green-300 flex flex-col items-center justify-center rotate-12">
        <div className="w-8 h-8 bg-green-500 rounded-full mb-2"></div>
        <span className="text-xs font-medium text-gray-600">Shopify Store</span>
      </div>
      <div className="absolute top-40 right-16 w-36 h-28 bg-white rounded-2xl shadow-xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center -rotate-6">
        <div className="w-6 h-6 bg-blue-500 rounded mb-1"></div>
        <span className="text-xs font-medium text-gray-600">Custom API</span>
      </div>
      <div className="absolute bottom-32 left-16 w-32 h-24 bg-white rounded-2xl shadow-xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center rotate-3">
        <div className="w-6 h-6 bg-purple-500 rounded mb-1"></div>
        <span className="text-xs font-medium text-gray-600">Mobile SDK</span>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Quick & Easy Setup
          </div>
          <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            From Zero to AI Hero
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              in Under 10 Minutes
            </span>
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed">
            No technical expertise required. Our setup process is so simple, your grandma could do it (and probably should, because she'd love Maya, Alex, and Sam).
          </p>
        </div>

        {/* Setup Steps */}
        <div className="mb-24">
          <h3 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Three Simple Steps
          </h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {setupSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector line */}
                {index < setupSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 z-0" />
                )}
                
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 relative z-10 border border-muted">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <div>
                      <h4 className="text-xl font-heading font-bold text-foreground mb-1">
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {step.time}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Options */}
        <div>
          <h3 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Choose Your Platform
          </h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <div key={index} className="group relative">
                <div className={`bg-gradient-to-br ${platform.bgColor} rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105`}>
                  <div className="bg-white/90 backdrop-blur rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <platform.icon className={`w-6 h-6 ${platform.iconColor}`} />
                      </div>
                      <h4 className="text-xl font-heading font-bold text-foreground">
                        {platform.name}
                      </h4>
                    </div>
                    
                    <p className="text-muted-foreground font-body leading-relaxed mb-6 flex-grow">
                      {platform.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {platform.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant={platform.buttonVariant} className="w-full group">
                      {platform.buttonText}
                      <platform.icon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Setup;