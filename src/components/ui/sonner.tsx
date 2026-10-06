"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle2, Info } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-150 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:font-semibold group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        error: (
          <div className="flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full w-5 h-5 shrink-0 font-extrabold text-xs select-none">
            !
          </div>
        ),
        success: (
          <div className="flex items-center justify-center bg-emerald-500 text-white rounded-full w-5 h-5 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        ),
        info: (
          <div className="flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 shrink-0">
            <Info className="w-3 h-3" />
          </div>
        ),
      }}
      {...props}
    />
  )
}

export { Toaster }
