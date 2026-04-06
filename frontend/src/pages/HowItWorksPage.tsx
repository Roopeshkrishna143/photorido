import { Breadcrumb } from "../components/Breadcrumb";
import { HowItWorks } from "../components/HowItWorks";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb items={[{ label: "How It Works" }]} />
      </div>
      <HowItWorks compact={false} />
    </div>
  );
}
