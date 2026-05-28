"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Send, CheckCircle } from "lucide-react"

export function ContactForm({ profileId }: { profileId: string }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await fetch(`/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          email: formData.get("email"),
          name: formData.get("name"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
        }),
      })
      setSent(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="border-brand-200 bg-brand-50 text-center">
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <CheckCircle className="h-8 w-8 text-brand-600" />
          <p className="font-semibold">Message envoyé !</p>
          <p className="text-sm text-muted-foreground">Je vous réponds au plus vite.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="contact-name" className="text-xs">Nom</Label>
        <Input id="contact-name" name="name" placeholder="Votre nom" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email" className="text-xs">Email</Label>
        <Input id="contact-email" name="email" type="email" placeholder="vous@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-xs">Message</Label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          placeholder="Votre message..."
          required
          className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <input id="contact-consent" name="consent" type="checkbox" required className="h-4 w-4 rounded" />
        <Label htmlFor="contact-consent" className="text-xs font-normal">J'accepte la politique de confidentialité</Label>
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  )
}
