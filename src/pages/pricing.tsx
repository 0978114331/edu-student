import { useNavigate } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI tools.',
    features: ['Access to free AI tools', 'Browse all resources', 'Save up to 5 favorites', 'Community support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Basic',
    price: '$9',
    period: 'per month',
    description: 'For students who want more tools and resources.',
    features: ['Everything in Free', 'Access to 20+ premium tools', 'Unlimited favorites', 'Recently used tracking', 'Priority email support'],
    cta: 'Choose Basic',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For teachers and power users.',
    features: ['Everything in Basic', 'All premium AI tools', 'Premium resources', 'Advanced analytics', 'API access', 'Priority support'],
    cta: 'Choose Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For universities and organizations.',
    features: ['Everything in Pro', 'Unlimited everything', 'Custom AI providers', 'Role-based access', 'Dedicated support', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export function PricingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold">Plans for every learner</h1>
          <p className="text-muted-foreground mt-4">Start free and upgrade as you grow. No hidden fees, cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.highlight ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => navigate('/signup')}
                >
                  {plan.cta}
                </Button>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
