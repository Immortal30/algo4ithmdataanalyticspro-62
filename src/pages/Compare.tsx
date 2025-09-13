import { DataComparison } from "@/components/DataComparison";

const Compare = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <DataComparison />
      </div>
    </div>
  );
};

export default Compare;