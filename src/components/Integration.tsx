import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Settings } from "lucide-react";

const Integration = () => {
  return (
    <section className="py-24 bg-gradient-sunset relative overflow-hidden">
      {/* Whimsical background elements */}
      <div className="absolute top-16 right-8 w-40 h-32 bg-white/20 rounded-full blur-2xl animate-pulse opacity-60" />
      <div className="absolute bottom-20 left-12 w-36 h-28 bg-white/15 rounded-full blur-xl animate-pulse opacity-50 delay-500" />
      
      {/* Floating connection lines placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" 
           title="Placeholder: Animated connection lines between platforms and avatars" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            Connects to
            <span className="block text-primary">Everything You Love</span>
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Your AI team seamlessly integrates with your existing tools. 
            Watch them learn from your data and become even more helpful.
          </p>
        </div>
        
        {/* Central avatar with connections */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Central illustration placeholder */}
          <div className="bg-white/30 border-2 border-dashed border-primary/40 rounded-3xl p-12 backdrop-blur-sm text-center">
            <div className="text-lg font-heading font-semibold text-primary mb-4">
              Central Integration Hub
            </div>
            <div className="text-sm text-muted-foreground max-w-lg mx-auto mb-8">
              Illustration showing the three AI avatars in the center, with connection lines 
              radiating out to various platform logos floating around them
            </div>
            
            {/* Avatar trio in center */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-pink-400 rounded-full border-4 border-white shadow-float" 
                   title="Maya - Support Avatar" />
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-blue-400 rounded-full border-4 border-white shadow-float" 
                   title="Alex - Sales Avatar" />
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-green-400 rounded-full border-4 border-white shadow-float" 
                   title="Sam - Analytics Avatar" />
            </div>
          </div>
        </div>
        
        {/* Platform grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Shopify", logo: "🛍️", color: "from-green-400 to-green-500" },
            { name: "WooCommerce", logo: "🔧", color: "from-purple-400 to-purple-500" },
            { name: "Magento", logo: "📦", color: "from-orange-400 to-orange-500" },
            { name: "BigCommerce", logo: "🏪", color: "from-blue-400 to-blue-500" },
            { name: "Stripe", logo: "💳", color: "from-indigo-400 to-indigo-500" },
            { name: "PayPal", logo: "💰", color: "from-yellow-400 to-yellow-500" },
            { name: "Mailchimp", logo: "📧", color: "from-pink-400 to-pink-500" },
            { name: "Zendesk", logo: "🎧", color: "from-teal-400 to-teal-500" }
          ].map((platform, index) => (
            <div 
              key={index}
              className="group relative"
            >
              <div className={`bg-gradient-to-r ${platform.color} rounded-2xl p-6 text-center hover:shadow-float transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden`}>
                {/* Floating effect */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{platform.logo}</div>
                  <h3 className="font-heading font-semibold text-white">{platform.name}</h3>
                  <div className="text-xs text-white/80 mt-1">Ready to connect</div>
                </div>
              </div>
              
              {/* Connection indicator */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center shadow-soft">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-float">
            <div className="text-lg font-heading font-semibold text-foreground mb-2">
              One-Click Setup
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Connect all your tools in under 5 minutes
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-200" />
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse delay-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;