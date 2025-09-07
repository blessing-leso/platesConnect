import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Brain, 
  MessageCircle, 
  Recycle, 
  MapPin, 
  Users,
  Smartphone,
  Leaf
} from "lucide-react";
import aiNutrition from "@/assets/ai-nutrition.jpg";
import circularEconomy from "@/assets/circular-economy.jpg";

export const Features = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Surplus-to-Plate Connector",
      description: "Smart automation matching system connects farmers' surplus with nearby kitchens based on proximity, meal schedules, and specific nutrition needs.",
      details: [
        "GPS-based food matching",
        "Surplus logging",
        "Automated kitchen notifications",
        "Nutrition-priority matching"
      ]
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI Meal Generator",
      description: "Builds nutrient-rich, low-cost menus using available surplus ingredients, optimized for different age groups and cooking resources.",
      details: [
        "Local produce optimization",
        "Resource-aware recipes",
        "Nutritional density focus"
      ]
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "WhatsApp Nutrition School",
      description: "Micro-lessons, recipes, and storytelling delivered in local languages with voice support for accessibility.",
      details: [
        "Local language support",
        "Voice-friendly interface",
        "Cultural recipe adaptation",
        "Grandmother wisdom integration"
      ]
    },
    {
      icon: <Recycle className="h-8 w-8 text-primary" />,
      title: "Circular Food Loop",
      description: "Complete waste management system where scraps become compost or biogas, creating earning opportunities for youth.",
      details: [
        "Composting programs",
        "Biogas generation",
        "Youth employment",
        "Logistics coordination"
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Complete Food Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From surplus logging to waste recycling, our AI-powered platform creates 
            a sustainable food network that benefits everyone in the community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-soft hover:shadow-glow transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  {feature.icon}
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm">
                      <Leaf className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Visual Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <img 
              src={aiNutrition} 
              alt="AI Nutrition Technology" 
              className="rounded-lg shadow-glow w-full h-auto"
            />
          </div>
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Smart Technology for Rural Communities
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">GPS-Based Matching</h4>
                  <p className="text-muted-foreground">Automatically connects surplus food with the nearest hungry families</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Smartphone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">WhatsApp Integration</h4>
                  <p className="text-muted-foreground">Works on any phone with simple form-based interactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Community Ownership</h4>
                  <p className="text-muted-foreground">Local youth operate and maintain the entire network</p>
                </div>
              </div>
            </div>
            <Button 
              variant="yellow" 
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See Technology in Action
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
          <div className="space-y-6 animate-slide-up order-2 lg:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Circular Economy Impact
            </h3>
            <p className="text-lg text-muted-foreground">
              Every part of our system creates value. Food waste becomes compost, 
              compost grows more food, and youth earn income through logistics and education.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Waste Diverted</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">Youth Jobs</div>
              </div>
            </div>
            <Button 
              variant="orange" 
              size="lg"
              onClick={() => window.open('https://whatsapp.com/channel/0029VbBH65DFXUuUXyoM0J3U', '_blank')}
            >
              Join the Movement
            </Button>
          </div>
          <div className="animate-slide-up order-1 lg:order-2" style={{ animationDelay: "0.2s" }}>
            <img 
              src={circularEconomy} 
              alt="Circular Economy" 
              className="rounded-lg shadow-glow w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};