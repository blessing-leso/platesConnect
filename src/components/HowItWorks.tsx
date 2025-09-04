import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Leaf,
  Smartphone, 
  Zap, 
  Users, 
  Recycle, 
  ArrowRight,
  Phone,
  MessageSquare,
  MapPin
} from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      title: "Log Surplus via WhatsApp",
      description: "Farmers send a simple message to Kaiǀūb's WhatsApp bot with photos and details. Our AI processes the images and GPS location automatically.",
      details: ["WhatsApp bot integration", "AI image recognition", "GPS location capture", "Automatic quantity estimation"]
    },
    {
      step: "02", 
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "AI Matches & Generates Meals",
      description: "Our AI instantly matches surplus with nearby kitchens and generates nutritious meal plans based on available ingredients and dietary needs.",
      details: ["Proximity-based matching", "Nutrition optimization", "Age-group customization", "Resource consideration"]
    },
    {
      step: "03",
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Community Connection & Education",
      description: "Families receive meal suggestions and cooking tips via WhatsApp in their local language, with voice support for accessibility.",
      details: ["Local language delivery", "Voice-friendly content", "Cultural recipe adaptation", "Cooking guidance"]
    },
    {
      step: "04",
      icon: <Recycle className="h-12 w-12 text-primary" />,
      title: "Circular Impact & Youth Earnings",
      description: "Food waste becomes compost or biogas, youth earn through logistics coordination, and the cycle continues sustainably.",
      details: ["Waste processing", "Biogas generation", "Youth employment", "Sustainable growth"]
    }
  ];

  const technologies = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "WhatsApp API",
      description: "Works on any phone, even basic smartphones with limited data"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "OpenAI Integration",
      description: "Generates culturally appropriate meals and nutrition education"
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "GPS Matching",
      description: "Real-time location services for optimal food distribution"
    }
  ];

  return (
  <div>
      <div className="container mx-auto flex h-16 items-center justify-between px-3 md:px-0 bg-background/95">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-primary">Kaiǀūb</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6 mr-5">
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Features
                </a>
                <a href="#impact" className="text-sm font-medium hover:text-primary transition-colors">
                  Impact
                </a>
                <a href="#community" className="text-sm font-medium hover:text-primary transition-colors">
                  Community
                </a>
              </nav>
      </div>
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A simple 4-step process that transforms food waste into community nourishment 
            while creating sustainable income opportunities.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="relative shadow-soft hover:shadow-glow transition-all duration-500 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                
                <div className="flex justify-center mb-4 mt-4">
                  {step.icon}
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{step.description}</p>
                
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="bg-card rounded-lg p-8 shadow-soft animate-fade-in">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Built for Rural Accessibility</h3>
            <p className="text-muted-foreground">
              Low-data design with robust offline capabilities and multi-language support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {technologies.map((tech, index) => (
              <div key={index} className="flex items-start space-x-3 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                {tech.icon}
                <div>
                  <h4 className="font-semibold text-foreground">{tech.title}</h4>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="orange" 
              size="lg"
              onClick={() => window.open('https://chat.whatsapp.com/join-kailub-community', '_blank')}
            >
              Join Movement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};