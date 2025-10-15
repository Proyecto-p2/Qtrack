import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CompletionData {
  percentage: number;
  doneTasks: number;
  totalTasks: number;
}

interface CompletionIndicatorProps {
  completion: CompletionData;
  threshold?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CompletionIndicator({ 
  completion, 
  threshold = 0.7, 
  showProgress = false,
  size = "md" 
}: CompletionIndicatorProps) {
  
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 0.9) return "default"; // Verde para 90%+
    if (percentage >= threshold) return "secondary"; // Azul para 70-89%
    return "destructive"; // Rojo para menos de 70%
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 0.9) return "🟢";
    if (percentage >= threshold) return "🟡";
    return "🔴";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return { badge: "text-xs", text: "text-xs", progress: "h-1" };
      case "lg":
        return { badge: "text-base", text: "text-base", progress: "h-3" };
      default:
        return { badge: "text-sm", text: "text-sm", progress: "h-2" };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={getCompletionColor(completion.percentage) as any} className={sizeClasses.badge}>
          {getCompletionIcon(completion.percentage)} {(completion.percentage * 100).toFixed(0)}%
        </Badge>
        <span className={`text-muted-foreground ${sizeClasses.text}`}>
          ({completion.doneTasks}/{completion.totalTasks})
        </span>
      </div>
      {showProgress && (
        <Progress 
          value={completion.percentage * 100} 
          className={`w-full ${sizeClasses.progress}`}
        />
      )}
    </div>
  );
}
