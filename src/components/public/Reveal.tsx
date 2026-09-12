import type { CSSProperties, ReactNode } from "react"

/**
 * Apparition en fondu pilotée par CSS (aucune dépendance JS) : le contenu est
 * présent et visible dans le HTML serveur, l'animation ne fait qu'adoucir
 * l'arrivée. `index` décale l'animation, plafonnée pour rester rapide.
 */
export function Reveal({
  index = 0,
  children,
  className,
  as: Tag = "div",
  style,
  ...rest
}: {
  index?: number
  children: ReactNode
  className?: string
  as?: "div" | "section" | "li" | "ul" | "main" | "footer"
  style?: CSSProperties
} & Record<string, unknown>) {
  const delay = Math.min(index * 45, 450)
  return (
    <Tag
      className={`animate-fade-in ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both", ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
