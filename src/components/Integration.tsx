import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Settings } from "lucide-react";

const Integration = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Integration landscape with bridges and platforms */}
      <div className="absolute top-8 left-8 sm:left-16 lg:left-24 w-40 sm:w-48 lg:w-56 h-24 sm:h-28 lg:h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl border-2 border-dashed border-green-400 transform rotate-3 animate-pulse">
        <div className="absolute inset-4 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-green-700 text-center">Shopify Integration Platform</span>
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-200 border border-dashed border-green-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-green-700 font-body">API</span>
        </div>
      </div>

      <div className="absolute top-16 sm:top-20 lg:top-24 right-8 sm:right-16 lg:right-24 w-36 sm:w-44 lg:w-52 h-22 sm:h-26 lg:h-30 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-xl border-2 border-dashed border-purple-400 transform -rotate-2 animate-bounce delay-300">
        <div className="absolute inset-4 flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-purple-700 text-center">Custom Website Bridge</span>
        </div>
        <div className="absolute -bottom-2 right-4 w-6 h-6 bg-purple-200 border border-dashed border-purple-500 rounded-md flex items-center justify-center">
          <span className="text-xs text-purple-700 font-body">JS</span>
        </div>
      </div>

      {/* Connection bridges */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-4 bg-gradient-to-r from-green-300 via-yellow-300 to-purple-300 rounded-full opacity-40 animate-pulse delay-700"></div>
      
      {/* Support avatars floating around */}
      <div className="absolute bottom-20 left-12 w-16 h-8 bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center animate-bounce delay-500">
        <span className="text-xs text-orange-700 font-body text-center">Tech Support Avatar</span>
      </div>

      <div className="absolute bottom-32 right-16 w-18 h-9 bg-cyan-100 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center animate-pulse delay-1000">
        <span className="text-xs text-cyan-700 font-body text-center">Integration Specialist</span>
      </div>

      <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-yellow-100 border-2 border-dashed border-yellow-400 rounded-xl flex items-center justify-center animate-bounce delay-200">
        <span className="text-xs text-yellow-700 font-heading font-semibold text-center">Setup Wizard Avatar</span>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header with floating setup avatar */}
        <div className="text-center mb-20 relative">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-28 h-14 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-sm font-heading font-semibold text-blue-700 text-center">Integration Captain</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 mt-8">
            Connect Your Store in Minutes
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Our AI assistants adapt to any platform. Whether it's Shopify, WooCommerce, or custom-built, 
            they'll feel right at home in your store.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Shopify Integration Island */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/50 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/30 rounded-full translate-y-12 -translate-x-12" />
            
            {/* Floating mini avatars around the card */}
            <div className="absolute -top-4 -left-4 w-12 h-6 bg-green-200 border border-dashed border-green-500 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-xs text-green-700 font-body">App Store</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-14 h-7 bg-lime-200 border border-dashed border-lime-500 rounded-lg flex items-center justify-center animate-bounce delay-400">
              <span className="text-xs text-lime-700 font-body">One-Click</span>
            </div>
            <div className="absolute top-1/2 -right-6 w-10 h-5 bg-teal-200 border border-dashed border-teal-500 rounded-md flex items-center justify-center animate-pulse delay-600">
              <span className="text-xs text-teal-700 font-body">Sync</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-heading font-bold text-gray-900">Shopify Store</h3>
                  <p className="text-green-700 font-body">The easiest path to AI</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Install Bizmis directly from the Shopify App Store. Your AI assistants will be greeting 
                customers within minutes, no technical setup required.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse" />
                  <span className="font-body font-medium">1-minute installation process</span>
                </div>
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse delay-200" />
                  <span className="font-body font-medium">Automatic product catalog sync</span>
                </div>
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse delay-400" />
                  <span className="font-body font-medium">Pre-built avatar personalities</span>
                </div>
              </div>
              
              <Button variant="warm" size="lg" className="group w-full shadow-xl">
                Install from App Store
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          
          {/* Custom Website Integration Island */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-200/30 rounded-full translate-y-14 -translate-x-14" />
            
            {/* Floating mini avatars around the card */}
            <div className="absolute -top-4 -left-4 w-14 h-7 bg-purple-200 border border-dashed border-purple-500 rounded-lg flex items-center justify-center animate-bounce">
              <span className="text-xs text-purple-700 font-body">Custom Code</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-8 bg-indigo-200 border border-dashed border-indigo-500 rounded-xl flex items-center justify-center animate-pulse delay-300">
              <span className="text-xs text-indigo-700 font-body">Tailored Setup</span>
            </div>
            <div className="absolute top-1/3 -left-6 w-12 h-6 bg-blue-200 border border-dashed border-blue-500 rounded-md flex items-center justify-center animate-bounce delay-500">
              <span className="text-xs text-blue-700 font-body">API</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-heading font-bold text-gray-900">Custom Website</h3>
                  <p className="text-purple-700 font-body">Perfectly fitted solution</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Our integration experts will analyze your website and create a custom deployment 
                that fits your unique architecture like a glove.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 animate-pulse" />
                  <span className="font-body font-medium">Comprehensive site assessment</span>
                </div>
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 animate-pulse delay-200" />
                  <span className="font-body font-medium">Custom avatar configuration</span>
                </div>
                <div className="flex items-center text-gray-700 bg-white/50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 animate-pulse delay-400" />
                  <span className="font-body font-medium">Dedicated technical support</span>
                </div>
              </div>
              
              <Button variant="outline" size="lg" className="group w-full border-purple-300 text-purple-700 hover:bg-purple-50 shadow-xl">
                Get Custom Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom integration landscape */}
        <div className="mt-20 relative">
          <div className="flex justify-center items-end space-x-6">
            <div className="w-20 h-12 bg-gradient-to-t from-red-100 to-pink-100 rounded-t-2xl border-2 border-dashed border-red-400 flex items-center justify-center">
              <span className="text-xs text-red-700 font-body text-center">WooCommerce Avatar</span>
            </div>
            <div className="w-24 h-16 bg-gradient-to-t from-blue-100 to-cyan-100 rounded-t-3xl border-2 border-dashed border-blue-400 flex items-center justify-center">
              <span className="text-xs text-blue-700 font-body text-center">Magento Helper</span>
            </div>
            <div className="w-32 h-20 bg-gradient-to-t from-green-100 to-emerald-100 rounded-t-3xl border-2 border-dashed border-green-400 flex items-center justify-center">
              <span className="text-xs text-green-700 font-heading font-semibold text-center">Universal Platform Hub</span>
            </div>
            <div className="w-28 h-18 bg-gradient-to-t from-purple-100 to-indigo-100 rounded-t-3xl border-2 border-dashed border-purple-400 flex items-center justify-center">
              <span className="text-xs text-purple-700 font-body text-center">BigCommerce Bridge</span>
            </div>
            <div className="w-22 h-14 bg-gradient-to-t from-orange-100 to-yellow-100 rounded-t-2xl border-2 border-dashed border-orange-400 flex items-center justify-center">
              <span className="text-xs text-orange-700 font-body text-center">Squarespace</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;