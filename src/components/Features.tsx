import { ShoppingCart, MessageCircle, TrendingUp } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Boost Sales Conversion",
      description: "Meet Sam, your dedicated sales avatar who guides customers through personalized shopping journeys and closes deals with charm.",
      benefits: ["Custom voice & personality", "Product recommendations", "Cart optimization"],
      color: "from-green-400 to-green-600",
      avatarColor: "green"
    },
    {
      icon: MessageCircle,
      title: "24/7 Customer Support", 
      description: "Luna, your support specialist, provides instant human-like assistance with endless patience and problem-solving skills.",
      benefits: ["Instant responses", "Human-like conversations", "Issue resolution"],
      color: "from-blue-400 to-blue-600",
      avatarColor: "blue"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Alex, your data scientist, analyzes every interaction to provide deep insights and actionable growth strategies.",
      benefits: ["Session recordings", "Conversation analytics", "Growth insights"],
      color: "from-purple-400 to-purple-600",
      avatarColor: "purple"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      {/* Floating avatar islands in the background */}
      <div className="absolute top-16 left-8 sm:left-16 lg:left-24 w-32 sm:w-40 lg:w-48 h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl shadow-lg transform rotate-12 animate-pulse">
        <div className="absolute inset-2 border-2 border-dashed border-green-500 rounded-2xl flex items-center justify-center">
          <span className="text-sm font-heading font-semibold text-green-700 text-center px-2">Sales Team Building</span>
        </div>
      </div>
      
      <div className="absolute top-32 sm:top-40 lg:top-48 right-4 sm:right-8 lg:right-16 w-28 sm:w-36 lg:w-44 h-18 sm:h-22 lg:h-26 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl shadow-lg transform -rotate-6 animate-bounce delay-300">
        <div className="absolute inset-2 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center">
          <span className="text-sm font-heading font-semibold text-blue-700 text-center px-2">Support Center</span>
        </div>
      </div>
      
      <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 left-4 sm:left-8 lg:left-12 w-36 sm:w-44 lg:w-52 h-22 sm:h-26 lg:h-30 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-3xl shadow-lg transform rotate-6 animate-pulse delay-700">
        <div className="absolute inset-2 border-2 border-dashed border-purple-500 rounded-2xl flex items-center justify-center">
          <span className="text-sm font-heading font-semibold text-purple-700 text-center px-2">Analytics Observatory</span>
        </div>
      </div>
      
      {/* Connecting paths between avatar islands */}
      <div className="absolute top-40 left-1/4 w-24 h-2 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-30 animate-pulse delay-500"></div>
      <div className="absolute top-60 right-1/3 w-20 h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-30 animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header with integrated avatar */}
        <div className="text-center mb-20 relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-xs font-heading font-semibold text-orange-700 text-center">Team Captain Avatar</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 mt-8">
            Meet Your AI Assistant Dream Team
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Each avatar has a unique personality and specialty, working together like the perfect store team 
            to create amazing customer experiences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-soft hover:shadow-brand transition-all duration-500 hover:-translate-y-4 relative overflow-hidden"
            >
              {/* Feature-specific avatar placeholders */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${
                feature.avatarColor === 'green' ? 'from-green-100 to-emerald-200 border-green-400' :
                feature.avatarColor === 'blue' ? 'from-blue-100 to-cyan-200 border-blue-400' :
                'from-purple-100 to-indigo-200 border-purple-400'
              } border-2 border-dashed rounded-full flex items-center justify-center shadow-lg animate-pulse z-10`}>
                <span className={`text-xs font-heading font-semibold ${
                  feature.avatarColor === 'green' ? 'text-green-700' :
                  feature.avatarColor === 'blue' ? 'text-blue-700' :
                  'text-purple-700'
                } text-center px-1`}>
                  {feature.avatarColor === 'green' ? 'Sam' : feature.avatarColor === 'blue' ? 'Luna' : 'Alex'}
                </span>
              </div>
              
              {/* Secondary mini avatars for context */}
              {index === 0 && (
                <>
                  <div className="absolute bottom-4 -left-4 w-12 h-6 bg-yellow-100 border border-dashed border-yellow-500 rounded-lg flex items-center justify-center animate-bounce delay-300">
                    <span className="text-xs text-yellow-700 font-body">Shopping Cart</span>
                  </div>
                  <div className="absolute top-1/2 -left-6 w-10 h-5 bg-rose-100 border border-dashed border-rose-500 rounded-md flex items-center justify-center animate-pulse delay-500">
                    <span className="text-xs text-rose-700 font-body">Customer</span>
                  </div>
                </>
              )}
              
              {index === 1 && (
                <>
                  <div className="absolute bottom-6 -right-4 w-14 h-7 bg-cyan-100 border border-dashed border-cyan-500 rounded-lg flex items-center justify-center animate-pulse delay-400">
                    <span className="text-xs text-cyan-700 font-body">Help Desk</span>
                  </div>
                  <div className="absolute top-1/3 -left-4 w-11 h-6 bg-teal-100 border border-dashed border-teal-500 rounded-md flex items-center justify-center animate-bounce delay-600">
                    <span className="text-xs text-teal-700 font-body">Chat Bot</span>
                  </div>
                </>
              )}
              
              {index === 2 && (
                <>
                  <div className="absolute bottom-2 -left-6 w-16 h-8 bg-indigo-100 border border-dashed border-indigo-500 rounded-xl flex items-center justify-center animate-pulse delay-200">
                    <span className="text-xs text-indigo-700 font-body">Dashboard</span>
                  </div>
                  <div className="absolute top-1/4 -right-8 w-12 h-6 bg-violet-100 border border-dashed border-violet-500 rounded-lg flex items-center justify-center animate-bounce delay-800">
                    <span className="text-xs text-violet-700 font-body">Reports</span>
                  </div>
                </>
              )}
              
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      feature.avatarColor === 'green' ? 'bg-green-500' :
                      feature.avatarColor === 'blue' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`} />
                    <span className="text-sm font-medium font-body">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom landscape with more avatars */}
        <div className="mt-20 relative">
          <div className="flex justify-center items-end space-x-8">
            <div className="w-24 h-16 bg-gradient-to-t from-red-100 to-pink-100 rounded-t-2xl border-2 border-dashed border-red-400 flex items-center justify-center">
              <span className="text-xs text-red-700 font-body text-center">Manager Avatar</span>
            </div>
            <div className="w-32 h-20 bg-gradient-to-t from-emerald-100 to-green-100 rounded-t-3xl border-2 border-dashed border-emerald-400 flex items-center justify-center">
              <span className="text-xs text-emerald-700 font-heading font-semibold text-center">Headquarters Building</span>
            </div>
            <div className="w-20 h-14 bg-gradient-to-t from-blue-100 to-sky-100 rounded-t-2xl border-2 border-dashed border-blue-400 flex items-center justify-center">
              <span className="text-xs text-blue-700 font-body text-center">Backup Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;