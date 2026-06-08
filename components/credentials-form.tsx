"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TempCredentials {
  clientId: string
  appKey: string
  appSecret: string
}

export function CredentialsForm() {
  const [expanded, setExpanded] = useState(false)
  const [credentials, setCredentials] = useState<TempCredentials>({
    clientId: "",
    appKey: "",
    appSecret: "",
  })
  const [saved, setSaved] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    if (credentials.clientId && credentials.appKey && credentials.appSecret) {
      // Armazenar em sessionStorage para usar na requisição
      sessionStorage.setItem("seniorTempCredentials", JSON.stringify(credentials))
      setSaved(true)

      setTimeout(() => setSaved(false), 3000)
    }
  }

  const hasSavedCredentials = !!sessionStorage.getItem("seniorTempCredentials")

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">Credenciais Temporárias - Senior X</CardTitle>
            <CardDescription className="text-sm">
              {hasSavedCredentials
                ? "✓ Credenciais configuradas para teste"
                : "Configure credenciais de teste (opcional)"}
            </CardDescription>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 border-t border-orange-200 pt-4">
          <p className="text-xs text-muted-foreground">
            Insira suas credenciais da Senior X Platform para testar a integração. As credenciais são armazenadas apenas
            na sessão do navegador.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-xs">
                Client ID
              </Label>
              <Input
                id="clientId"
                name="clientId"
                value={credentials.clientId}
                onChange={handleInputChange}
                placeholder="Seu Client ID"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appKey" className="text-xs">
                App Key
              </Label>
              <Input
                id="appKey"
                name="appKey"
                value={credentials.appKey}
                onChange={handleInputChange}
                placeholder="Sua App Key"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSecret" className="text-xs">
                App Secret
              </Label>
              <Input
                id="appSecret"
                name="appSecret"
                type="password"
                value={credentials.appSecret}
                onChange={handleInputChange}
                placeholder="Seu App Secret"
                className="text-xs"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!credentials.clientId || !credentials.appKey || !credentials.appSecret}
          >
            {saved ? "✓ Salvo em sessão" : "Salvar Credenciais"}
          </Button>

          <p className="text-xs text-yellow-700 font-medium">
            ⚠️ Essas credenciais são armazenadas apenas nesta sessão. Para produção, configure as variáveis de ambiente
            no Vercel.
          </p>
        </CardContent>
      )}
    </Card>
  )
}
