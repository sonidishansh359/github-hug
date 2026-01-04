import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  gradient?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, gradient, iconColor }: StatCardProps) {
  return (
    <div className={cn('bg-card rounded-2xl p-6 border border-border shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm font-medium mt-2',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from yesterday
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center', gradient && `bg-gradient-to-br ${gradient}`)}>
          <Icon className={cn('w-6 h-6 text-primary', iconColor)} />
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        {typeof title === 'string' ? (
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        ) : (
          title
        )}
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
