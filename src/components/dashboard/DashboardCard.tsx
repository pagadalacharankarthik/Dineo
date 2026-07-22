import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "orange" | "blue" | "green" | "purple" | "pink";
  loading?: boolean;
}

const colorMap = {
  orange: "from-orange-500 to-amber-500",
  blue: "from-blue-500 to-cyan-500",
  green: "from-green-500 to-emerald-500",
  purple: "from-purple-500 to-violet-500",
  pink: "from-pink-500 to-rose-500",
};

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  color = "orange",
  loading = false,
}: DashboardCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="h-8 w-24 rounded bg-muted mb-2" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="group relative p-6 rounded-2xl border border-border bg-card/75 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 overflow-hidden">
      <div className={cn("absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300", colorMap[color])} />
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md shadow-primary/10",
            colorMap[color]
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && trendValue && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
