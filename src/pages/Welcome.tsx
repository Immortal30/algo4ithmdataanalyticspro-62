import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Sparkles,
  Database,
  Brain,
  FileUp,
  Share2,
  Download,
  Zap,
  TrendingUp,
  Shield,
  ChevronRight,
  ArrowRight,
  Check,
  Star,
  Users,
  Activity,
  Globe,
  Code2,
  Layers,
  ChartNoAxesGantt
} from 'lucide-react';

const Welcome = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Charts",
      description: "Natural language processing creates perfect visualizations with predictive analytics",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Brain,
      title: "Smart Insights",
      description: "Advanced AI algorithms analyze patterns and provide actionable recommendations",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Real-time Analytics",
      description: "Lightning-fast processing handles millions of data points instantly",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Share2,
      title: "Collaborative Dashboards",
      description: "Share interactive dashboards with your team using secure links",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption keeps your sensitive data protected",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Database,
      title: "Big Data Ready",
      description: "Optimized for massive datasets with virtualized rendering",
      gradient: "from-rose-500 to-pink-500"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-dashboard-primary/30 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-dashboard-accent/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-dashboard-secondary/25 rounded-full blur-[128px] animate-pulse delay-500" />
        </div>

        <div className="relative container mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-dashboard-primary/20 to-dashboard-accent/20 rounded-2xl border border-dashboard-primary/30 backdrop-blur-sm">
              <BarChart3 className="h-12 w-12 text-dashboard-primary" />
            </div>

            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-secondary bg-clip-text text-transparent">
                  Analytics Pro
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Transform your data into intelligent insights with AI-powered analytics and beautiful visualizations
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="group bg-gradient-to-r from-dashboard-primary to-dashboard-accent hover:opacity-90 text-white px-8">
                  <FileUp className="mr-2 h-5 w-5" />
                  Upload Your Data
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 pt-8">
              <Badge variant="secondary" className="px-4 py-2 bg-background/50 backdrop-blur-sm">
                <Shield className="mr-2 h-4 w-4 text-green-500" />
                SOC 2 Certified
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-background/50 backdrop-blur-sm">
                <Check className="mr-2 h-4 w-4 text-blue-500" />
                GDPR Compliant
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-background/50 backdrop-blur-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                Top Rated
              </Badge>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-16 max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="relative rounded-xl overflow-hidden border border-dashboard-primary/20 shadow-2xl">
              <div className="bg-gradient-to-br from-card/90 to-card/70 p-8">
                <div className="grid grid-cols-3 gap-4">
                  {[LineChart, BarChart3, PieChart].map((Icon, index) => (
                    <Card key={index} className="bg-card/50 border-dashboard-primary/10">
                      <CardContent className="p-6">
                        <Icon className="h-8 w-8 text-dashboard-primary mb-2" />
                        <div className="h-2 bg-muted rounded-full mb-2" />
                        <div className="h-2 bg-muted rounded-full w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Modern Analytics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform raw data into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm border-dashboard-primary/10 hover:border-dashboard-primary/30"
                >
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Welcome;