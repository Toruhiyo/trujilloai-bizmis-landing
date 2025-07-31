import { Button } from "@/components/ui/button";
import { Zap, Download } from "lucide-react";

const BizmisIntegration = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
              Ready out of the box
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bizmis installs from the Shopify App Store. No setup needed.
            </p>
          </div>

          <div className="bg-gradient-warm rounded-3xl p-8 lg:p-12 text-center shadow-brand">
            <div className="space-y-8">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white">
                  Install. Activate. Start Selling.
                </h3>
                <div className="space-y-3 text-white/90 max-w-2xl mx-auto">
                  <p className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 bg-white/80 rounded-full" />
                    Instantly connects to your catalog, inventory, and store policies
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 bg-white/80 rounded-full" />
                    Starts working the moment it's installed
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 bg-white/80 rounded-full" />
                    No training, no configuration — just results
                  </p>
                </div>
              </div>

              <Button 
                variant="outline"
                size="lg"
                className="bg-white text-primary border-0 hover:bg-white/90 transition-all duration-300 font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Install from Shopify App Store
              </Button>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-muted-foreground">
              Need a custom integration for your website? 
              <span className="text-primary font-medium ml-1">Let's talk.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisIntegration;