import { Header } from "@/components/Header";
import { Home } from "@/components/Home";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Home />
      <Features />
      <CTA />
    </div>
  );
};

export default Index;