import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  className?: string;
}

export function Loading({ text = "Loading...", className = "" }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function FullPageLoading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading text={text} />
    </div>
  );
}

export function CardLoading({
  text = "Loading...",
  rows = 3,
}: LoadingProps & { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
          </div>
        </div>
      ))}
      {text && (
        <div className="text-center py-4">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

interface ButtonLoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText: string;
}

export function ButtonLoading({
  children,
  isLoading,
  loadingText,
  ...props
}: ButtonLoadingProps) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
