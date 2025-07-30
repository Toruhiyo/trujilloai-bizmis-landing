import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-warm relative overflow-hidden">
      {/* Success story avatar islands floating around */}
      <div className="absolute top-12 left-8 sm:left-16 w-32 sm:w-40 h-20 sm:h-24 bg-gradient-to-br from-emerald-100/90 to-green-200/90 rounded-3xl shadow-xl border-2 border-dashed border-green-400/70 backdrop-blur-sm animate-bounce">
        <div className="absolute inset-3 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-green-800 text-center">Success Story Avatar</span>
        </div>
      </div>
      
      <div className="absolute top-24 right-8 sm:right-16 w-28 sm:w-36 h-18 sm:h-22 bg-gradient-to-br from-blue-100/90 to-cyan-200/90 rounded-2xl shadow-xl border-2 border-dashed border-blue-400/70 backdrop-blur-sm animate-pulse delay-300">
        <div className="absolute inset-3 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-blue-800 text-center">Happy Customer Island</span>
        </div>
      </div>
      
      <div className="absolute bottom-16 left-12 sm:left-20 w-24 sm:w-32 h-16 sm:h-20 bg-gradient-to-br from-purple-100/90 to-indigo-200/90 rounded-xl shadow-xl border-2 border-dashed border-purple-400/70 backdrop-blur-sm animate-bounce delay-700">
        <div className="absolute inset-3 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-purple-800 text-center">ROI Calculator</span>
        </div>
      </div>
      
      <div className="absolute bottom-12 right-16 sm:right-24 w-20 sm:w-28 h-12 sm:h-16 bg-gradient-to-br from-orange-100/90 to-yellow-200/90 rounded-2xl shadow-xl border-2 border-dashed border-orange-400/70 backdrop-blur-sm animate-pulse delay-500">
        <div className="absolute inset-2 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-orange-800 text-center">Trial Guide</span>
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 mb-10 relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-r from-white/90 to-white/80 border-2 border-dashed border-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce backdrop-blur-sm">
              <span className="text-sm font-heading font-bold text-gray-800 text-center">Decision Maker Avatar</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight mt-8">
              Ready to Transform Your Store?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Join thousands of store owners who've discovered the magic of AI assistants.
            </p>
          </div>
          
          {/* Social proof with integrated mini avatars */}
          <div className="flex items-center justify-center gap-4 mb-8 relative">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-white/90 font-body ml-2">Trusted by 1000+ stores</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              variant="hero" 
              size="xl"
              className="group shadow-2xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 backdrop-blur-sm shadow-xl"
            >
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-white/70 text-sm">
            14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;