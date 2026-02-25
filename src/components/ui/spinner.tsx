import * as React from "react"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string
  color?: string
  label?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "w-6 h-6",
  color = "border-primary",
  label = "loading...",
  className = "",
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className={`inline-block ${className}`}
      {...props}
    >
      <div
        className={`rounded-full border-4 border-t-transparent animate-spin ${size} ${color}`}
      />
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  )
}
