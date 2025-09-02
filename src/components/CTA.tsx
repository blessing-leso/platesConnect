import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Users } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 bg-gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Community's Food System?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of communities already using Kaiǀūb to eliminate food waste, 
            improve nutrition, and create sustainable livelihoods.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg" 
              variant="yellow" 
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://wa.me/+27123456789?text=Hello,%20I%20want%20to%20log%20surplus%20food%20on%20Kaiǀūb', '_blank')}
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Start on WhatsApp
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="orange" 
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://chat.whatsapp.com/join-kailub-community', '_blank')}
            >
              <Users className="mr-2 h-5 w-5" />
              Join Movement
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">Free</div>
              <div className="text-primary-foreground/80">Always free for communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">WhatsApp support available</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Real-time</div>
              <div className="text-primary-foreground/80">Instant AI matching & responses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};