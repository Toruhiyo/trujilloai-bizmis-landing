import React from "react";
import {
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Zap,
  ArrowUp,
  Clock,
  Heart,
  Shield,
  Play,
  Tag,
  BarChart3,
  Users,
  ShoppingBag,
  MessageSquare,
  Headphones,
  Activity,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Reusable Benefit Badge Component
const BenefitBadge = ({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className: string }>;
  text: string;
}) => (
  <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-6 py-3 mb-6">
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-primary font-medium">{text}</span>
  </div>
);

const ValueShowcase = () => {
  return (
    <div className="space-y-0">
      {/* Benefit 1: Sales Conversion - Chaotic Split Layout */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        {/* Background Pattern - More Chaotic */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-dark rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <BenefitBadge
                icon={({ className }: { className: string }) => (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className={className} />
                    <ArrowUp className="w-4 h-4 text-primary" strokeWidth={3} />
                  </div>
                )}
                text="Sales Conversion"
              />
              <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
                Increase Sales Conversion
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed">
                Shoppers feel personally guided—finding the right product fast
                and checking out with confidence.
              </p>
            </div>

            {/* Big Images with Overlapping Features Layout */}
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              {/* Left Side - Customization */}
              <div className="relative">
                {/* Big Customization Image */}
                <div className="bg-gradient-to-br from-primary/30 to-primary-light/40 rounded-3xl aspect-[4/3] flex items-center justify-center transform rotate-1 hover:rotate-0 transition-transform duration-500 border-2 border-primary/30 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <Users className="w-40 h-40 text-primary mx-auto" />
                    <div className="space-y-3">
                      <div className="text-primary-dark font-heading font-bold text-2xl">
                        Voice & Look Customization
                      </div>
                      <div className="text-primary/70 text-base max-w-sm mx-auto">
                        [Image: AI avatar customization interface with voice
                        cloning setup and personality matching tools]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Feature Cards */}
                <div className="absolute -bottom-8 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 max-w-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        Voice & Look That Match You
                      </h4>
                      <p className="text-muted-foreground font-body text-sm">
                        Your assistant sounds and looks like you, creating
                        genuine connections.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 max-w-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        Voice Cloning Technology
                      </h4>
                      <p className="text-muted-foreground font-body text-sm">
                        Advanced AI replicates your unique speaking style and
                        personality.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Label */}
                <div className="absolute top-6 left-6 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-primary font-medium text-sm">
                      Customization
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Drive Sales */}
              <div className="relative lg:mt-16">
                {/* Big Drive Sales Image */}
                <div className="bg-gradient-to-br from-primary-light/30 to-primary/40 rounded-3xl aspect-[4/3] flex items-center justify-center transform -rotate-1 hover:rotate-0 transition-transform duration-500 border-2 border-primary/30 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <div className="relative">
                      <ShoppingCart className="w-40 h-40 text-primary mx-auto" />
                      <ArrowUp
                        className="w-12 h-12 text-primary-dark absolute -top-3 -right-6"
                        strokeWidth={3}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="text-primary-dark font-heading font-bold text-2xl">
                        Driven Sales Interface
                      </div>
                      <div className="text-primary/70 text-base max-w-sm mx-auto">
                        [Image: Product recommendation engine with comparison
                        tools and conversion optimization]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Feature Cards */}
                <div className="absolute -bottom-6 -right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 max-w-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        Tailored Product Picks
                      </h4>
                      <p className="text-muted-foreground font-body text-sm">
                        Smart recommendations that help customers discover
                        products they'll love.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-8 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 max-w-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        Products Comparisons
                      </h4>
                      <p className="text-muted-foreground font-body text-sm">
                        Side-by-side comparisons help customers make confident
                        decisions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Label */}
                <div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span className="text-primary font-medium text-sm">
                      Drive Sales
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 2: Customer Support - Split Diagonal */}
      <section className="relative py-24 bg-gradient-to-r from-primary-dark/5 to-primary/5 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary-light/30 to-primary/30 rounded-3xl aspect-square flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-center space-y-4 transform -rotate-3">
                  <MessageCircle className="w-32 h-32 text-primary mx-auto" />
                  <div className="text-primary-dark font-heading font-bold text-lg">
                    24/7 Support Interface
                  </div>
                  <div className="text-primary/70 text-sm">
                    [Image placeholder: Chat interface with customer
                    conversations]
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-full p-4 shadow-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <BenefitBadge icon={MessageCircle} text="Customer Support" />
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                  24/7 Human-Feel Support
                </h2>
                <p className="text-xl text-muted-foreground font-body leading-relaxed">
                  Questions answered instantly, any hour, in a voice that feels
                  genuinely helpful.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Always online, never waiting
                    </h3>
                    <p className="text-muted-foreground font-body">
                      No waiting times, no business hours — your assistant is
                      ready to help customers whenever they need it.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Warm, conversational replies
                    </h3>
                    <p className="text-muted-foreground font-body">
                      Responds with genuine warmth and understanding, making
                      customers feel heard and valued.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Reassurance during checkout
                    </h3>
                    <p className="text-muted-foreground font-body">
                      Guides customers through concerns and decision-making with
                      patience and expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 3: Store Insights - Chaotic Asymmetric Layout */}
      <section className="py-24 bg-gradient-to-tr from-primary/8 via-background to-primary-light/12 relative overflow-hidden">
        {/* Chaotic Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-primary-dark rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Asymmetric Header */}
            <div className="grid lg:grid-cols-3 gap-16 items-start mb-20">
              <div className="lg:col-span-2">
                <BenefitBadge icon={Activity} text="Store Insights" />
                <h2 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6 transform -rotate-1">
                  Understand & Improve Your Store
                </h2>
                <p className="text-xl text-muted-foreground font-body leading-relaxed">
                  See what customers do, say, and need—then fine-tune your shop
                  with real insights.
                </p>
              </div>

              {/* Floating Stats Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-primary/20 lg:mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-heading font-bold text-primary mb-1">
                    95%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Insight Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Chaotic Layout */}
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              {/* Left Features - Stacked */}
              <div className="lg:col-span-2 space-y-8">
                {/* Feature 1 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Session Replays
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Watch how customers navigate and interact with your
                        assistant to identify improvement opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Tag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Auto-Tagged Chats
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Automatically categorized customer interactions reveal
                        common questions and pain points.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Interaction Dashboard
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Clear analytics showing customer behavior trends,
                        popular products, and conversion patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image - Large Single Image */}
              <div className="lg:col-span-3 relative">
                {/* Main Dashboard Image */}
                <div className="bg-gradient-to-br from-primary/20 to-primary-light/30 rounded-3xl aspect-[4/3] flex items-center justify-center border-2 border-primary/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <Activity className="w-32 h-32 text-primary mx-auto" />
                    <div className="space-y-3">
                      <div className="text-primary-dark font-heading font-bold text-2xl">
                        Analytics Dashboard
                      </div>
                      <div className="text-primary/70 text-base max-w-md mx-auto">
                        [Image: Complete analytics dashboard showing session
                        replays, chat categorization, and interaction metrics in
                        one unified interface]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Mini Cards */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border border-primary/20 transform rotate-12 hover:rotate-6 transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      Live Sessions
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl p-4 shadow-lg border border-primary/20 transform -rotate-6 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      Smart Tags
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 4: Integration - Side-by-Side Showcase */}
      <section className="py-24 bg-gradient-to-r from-primary/5 via-background to-primary-light/10 border-t border-primary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <BenefitBadge icon={Zap} text="Integration Options" />
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                Choose Your Integration Path
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Choose the integration that works best for your store setup.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Shopify Integration */}
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-3xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                  <div className="absolute -top-4 left-8 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                    Recommended
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-foreground">
                        Shopify App Store
                      </h3>
                      <p className="text-primary">One-click installation</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    Install Bizmis directly from the Shopify App Store.
                    One-click setup, no coding required.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      "1-click install",
                      "Catalog and store data auto-synced",
                      "Ready instantly",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-muted-foreground"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span className="font-body">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 mb-6">
                    <div className="text-center text-primary/60 text-sm">
                      [Shopify app store integration mockup]
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                    Get it on Shopify
                  </Button>
                </div>
              </div>

              {/* Custom Integration */}
              <div className="bg-gradient-to-br from-primary-light/10 to-primary/10 rounded-3xl p-8 border border-primary/20 hover:border-primary/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-foreground">
                      Custom Website
                    </h3>
                    <p className="text-primary">Tailored integration</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Tailored integration for your unique website. We assess and
                  customize everything to fit perfectly.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Tailor-made setup",
                    "Custom assessment",
                    "Schedule a discovery call",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-primary-light rounded-full mr-3" />
                      <span className="font-body">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 mb-6">
                  <div className="text-center text-primary/60 text-sm">
                    [Custom integration process diagram]
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Schedule a Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValueShowcase;
