"use client"

import { useState } from "react"
import { useCredentialsStore } from "@/lib/credentials-store"
import type { SeniorCredentials } from "@/lib/credentials-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Plug, Info, CheckCircle2, XCircle } from "lucide-react"

interface SettingsFormProps {
  redirectTo?: string
  onSaved?: () => void
}

export function SettingsForm({ redirectTo = "/", onSaved }: SettingsFormProps) {
  const { toast } = useToast()
  const { credentials, setCredentials } = useCredentialsStore()

  const [form, setForm] = useState<SeniorCredentials>({
    baseUrl: credentials?.baseUrl || "https://api.senior.com.br",
    clientId: credentials?.clientId || "",
    tenant: credentials?.tenant || "",
    authMethod: credentials?.authMethod || "appkey",
    username: credentials?.username || "",
    password: credentials?.password || "",
    appKey: credentials?.appKey || "",
    appSecret: credentials?.appSecret || "",
  })

  const [showSecret, setShowSecret] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAuthMethodChange = (value: string) => {
    setForm((prev) => ({ ...prev, authMethod: value as "userpass" | "appkey" }))
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setTestResult({ success: data.success, message: data.message })
    } catch {
      setTestResult({ success: false, message: "Nao foi possivel conectar ao servidor" })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!form.baseUrl || !form.clientId || !form.tenant || !form.authMethod) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha URL, Client ID, Tenant e selecione o metodo de autenticacao",
        variant: "destructive",
      })
      return
    }

    if (form.authMethod === "userpass" && (!form.username || !form.password)) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha usuario e senha",
        variant: "destructive",
      })
      return
    }

    if (form.authMethod === "appkey" && (!form.appKey || !form.appSecret)) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha Client ID e Client Secret",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    // clientId (gateway header) = appKey (Senior Client ID) — same value, two API roles
    setCredentials({ ...form, clientId: form.appKey || form.clientId })
    await new Promise((r) => setTimeout(r, 300))
    toast({
      title: "Configuracoes salvas!",
      description: "Credenciais da API Senior X foram salvas com sucesso.",
    })
    setSaving(false)

    if (onSaved) {
      onSaved()
    } else if (redirectTo && redirectTo !== "/") {
      window.location.href = redirectTo
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          Configure as credenciais da API Senior X para enviar pedidos automaticamente para o ERP.
          As configuracoes ficam salvas no seu navegador.
        </p>
      </div>

      {/* Section A: Conexao */}
      <Card>
        <CardHeader>
          <CardTitle>Conexao</CardTitle>
          <CardDescription>Dados de acesso ao Senior X Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL da API</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              value={form.baseUrl}
              onChange={handleChange}
              placeholder="https://api.senior.com.br"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant</Label>
            <Input
              id="tenant"
              name="tenant"
              value={form.tenant}
              onChange={handleChange}
              placeholder="nome_da_empresa"
            />
            <p className="text-xs text-muted-foreground">Nome da empresa no Senior X</p>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Metodo de autenticacao */}
      <Card>
        <CardHeader>
          <CardTitle>Metodo de autenticacao</CardTitle>
          <CardDescription>Selecione como autenticar na API Senior X</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            value={form.authMethod}
            onValueChange={handleAuthMethodChange}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="appkey" id="auth-appkey" />
              <Label htmlFor="auth-appkey" className="cursor-pointer font-normal">
                Chave de Aplicacao
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="userpass" id="auth-userpass" />
              <Label htmlFor="auth-userpass" className="cursor-pointer font-normal">
                Usuario e Senha
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          {form.authMethod === "appkey" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appKey">Client ID</Label>
                <Input
                  id="appKey"
                  name="appKey"
                  value={form.appKey}
                  onChange={handleChange}
                  placeholder="ex: e33b41c2-d5f4-4106-ac2b-a4758b66d2d5"
                />
                <p className="text-xs text-muted-foreground">
                  Campo <strong>Client ID</strong> exibido em "APP Info" no portal{" "}
                  <a
                    href="http://api.xplatform.com.br/api-portal/pt-br/myapps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    dev.senior.com.br
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appSecret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="appSecret"
                    name="appSecret"
                    type={showSecret ? "text" : "password"}
                    value={form.appSecret}
                    onChange={handleChange}
                    placeholder="ex: 135a4488-4bf3-4b91-b43d-8fd4e08aefb2"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Campo <strong>Client Secret</strong> exibido em "APP Info" no portal dev.senior.com.br
                </p>
              </div>
            </div>
          )}

          {form.authMethod === "userpass" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="usuario@tenant.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Senha de acesso"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              className="flex-1 bg-transparent"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Plug className="mr-2 h-4 w-4" />
                  Testar Conexao
                </>
              )}
            </Button>

            <Button type="button" onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configuracoes"
              )}
            </Button>
          </div>

          {testResult && (
            <div className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
              testResult.success
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            }`}>
              {testResult.success
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className="font-semibold">{testResult.success ? "Conexao bem-sucedida!" : "Falha na conexao"}</p>
                <p className="mt-0.5 text-xs opacity-80">{testResult.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
