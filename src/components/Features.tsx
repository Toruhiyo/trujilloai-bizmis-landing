import { ShoppingCart, MessageCircle, TrendingUp, Star, Clock } from "lucide-react";

const Features = () => {
  const storyChapters = [
    {
      chapter: "Chapter 2",
      title: "Emma Meets Sarah (The Shopper)",
      character: "Emma",
      dialogue: "I noticed you're looking at winter coats! I can help you find the perfect one based on your style and budget.",
      customerResponse: "That would be amazing! I'm looking for something warm but stylish for work.",
      outcome: "250% increase in conversion rate",
      icon: ShoppingCart,
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      chapter: "Chapter 3", 
      title: "Emma Handles a Problem",
      character: "Emma",
      dialogue: "I see your order is delayed. Let me check that for you right away and provide an update!",
      customerResponse: "Thank you! I was getting worried about my delivery.",
      outcome: "24/7 instant support resolution",
      icon: MessageCircle,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      chapter: "Chapter 4",
      title: "Emma Learns & Improves",
      character: "Emma",
      dialogue: "I've analyzed 1,000+ customer conversations and I'm getting smarter every day!",
      customerResponse: "The insights help me understand my customers better than ever.",
      outcome: "Deep analytics & continuous learning",
      icon: TrendingUp,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Story Introduction */}
        <div className="text-center mb-16">
          <div className="inline-block bg-white rounded-full px-6 py-2 shadow-panel border border-primary mb-6">
            <span className="text-sm font-heading font-bold text-primary">Emma's Daily Adventures</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            A Day in the Life of Your AI Assistant
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Follow Emma through real customer interactions and see how she transforms your store experience.
          </p>
        </div>
        
        {/* Story Chapters as Comic Panels */}
        <div className="space-y-12">
          {storyChapters.map((story, index) => (
            <div 
              key={index}
              className={`relative ${story.bgColor} rounded-3xl p-8 shadow-panel border-2 ${story.borderColor} overflow-hidden`}
            >
              {/* Comic panel border effect */}
              <div className="absolute -top-2 -right-2 w-full h-full bg-primary/10 rounded-3xl -z-10" />
              
              {/* Chapter number */}
              <div className="absolute top-4 left-4">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-soft">
                  <story.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <div className="pt-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Story Content */}
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-heading font-bold text-primary mb-2">{story.chapter}</div>
                      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-4">
                        {story.title}
                      </h3>
                    </div>
                    
                    {/* Dialogue Bubbles */}
                    <div className="space-y-4">
                      {/* Emma's dialogue */}
                      <div className="relative bg-gradient-speech rounded-2xl p-4 shadow-speech border border-primary/20 max-w-md">
                        <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white" />
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">E</span>
                          </div>
                          <p className="text-sm font-body text-foreground">"{story.dialogue}"</p>
                        </div>
                      </div>
                      
                      {/* Customer response */}
                      <div className="relative bg-white rounded-2xl p-4 shadow-soft border border-border max-w-md ml-auto">
                        <div className="absolute -bottom-3 right-6 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white" />
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">C</span>
                          </div>
                          <p className="text-sm font-body text-foreground">"{story.customerResponse}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Outcome Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-panel border border-border">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <h4 className="font-heading font-bold text-foreground text-lg">Result:</h4>
                      <p className="text-primary font-body font-semibold text-lg">{story.outcome}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Real customer interaction</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Story Continuation */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-panel border border-border">
            <span className="font-body text-muted-foreground">Want to see Emma in action at your store?</span>
            <div className="w-6 h-6 bg-primary rounded-full animate-pulse flex items-center justify-center">
              <span className="text-xs font-bold text-white">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;