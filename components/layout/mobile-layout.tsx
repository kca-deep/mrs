import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  step?: {
    current: number
    total: number
    label?: string
  }
  className?: string
}

export function MobileLayout({
  children,
  title,
  subtitle,
  step,
  className,
}: MobileLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background", className)}>
      {/* Header */}
      {(title || step) && (
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-lg px-4 py-4">
            {step && (
              <div className="mb-2 flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: step.total }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-8 rounded-full transition-colors",
                        i < step.current ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                {step.label && (
                  <span className="text-xs text-muted-foreground">
                    {step.current}/{step.total} {step.label}
                  </span>
                )}
              </div>
            )}
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1">
        <div className="container max-w-lg px-4 py-6">{children}</div>
      </main>
    </div>
  )
}

interface MobileFooterProps {
  children: React.ReactNode
  className?: string
}

export function MobileFooter({ children, className }: MobileFooterProps) {
  return (
    <footer
      className={cn(
        "sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container max-w-lg px-4 py-4">{children}</div>
    </footer>
  )
}
