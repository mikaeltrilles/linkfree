"use client"

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Remplace window.confirm() par une modale intégrée au site.
 * Usage : const confirm = useConfirm(); if (await confirm({ title: "…" })) { … }
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false)
      resolver.current = resolve
      setOptions(opts)
    })
  }, [])

  function close(value: boolean) {
    resolver.current?.(value)
    resolver.current = null
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={options !== null} onOpenChange={(open) => { if (!open) close(false) }}>
        <DialogContent className="sm:max-w-md">
          {options && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {options.destructive && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  {options.title}
                </DialogTitle>
              </DialogHeader>
              {options.description && (
                <p className="text-sm text-muted-foreground">{options.description}</p>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => close(false)} autoFocus>
                  {options.cancelLabel ?? "Annuler"}
                </Button>
                <Button variant={options.destructive ? "destructive" : "default"} onClick={() => close(true)}>
                  {options.confirmLabel ?? "Confirmer"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm doit être utilisé dans un ConfirmProvider")
  return ctx
}
