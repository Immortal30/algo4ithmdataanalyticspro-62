import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  trend?: number;
  subtitle?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  className, 
  trend, 
  subtitle 
}: KPICardProps) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-dashboard-success" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-dashboard-danger" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-dashboard-success';
      case 'decrease':
        return 'text-dashboard-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border hover:shadow-lg hover:shadow-dashboard-primary/10 transition-all duration-300 group overflow-hidden",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-dashboard-primary transition-colors duration-300 break-all">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-muted-foreground/20">
                {getTrendIcon()}
                <span className={cn("text-xs font-semibold", getTrendColor())}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {changeType === 'increase' ? 'vs last period' : changeType === 'decrease' ? 'vs last period' : 'no change'}
                </span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-dashboard-primary/10 to-dashboard-secondary/10 text-dashboard-primary group-hover:from-dashboard-primary/20 group-hover:to-dashboard-secondary/20 transition-all duration-300 border border-dashboard-primary/20">
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative bottom border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-dashboard-primary via-dashboard-secondary to-dashboard-accent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Card>
  );
};