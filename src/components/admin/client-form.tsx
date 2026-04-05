"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ArrowLeft,
    Copy,
    Check,
    Eye,
    EyeOff,
    RotateCcw,
    Trash2,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { RedirectUriInput } from "./redirect-uri-input"
import {
    updateClient,
    deleteClient,
    rotateClientSecret,
} from "@/lib/actions/admin-clients"
import type { OAuthClientRow } from "@/lib/actions/admin-clients"

const AVAILABLE_SCOPES = ["openid", "profile", "email", "offline_access"]
const GRANT_TYPES = ["authorization_code", "refresh_token", "client_credentials"]

export function ClientForm({ client }: { client: OAuthClientRow }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState(client.name ?? "")
    const [uri, setUri] = useState(client.uri ?? "")
    const [icon, setIcon] = useState(client.icon ?? "")
    const [redirectUris, setRedirectUris] = useState<string[]>(client.redirectUris ?? [])
    const [scopes, setScopes] = useState<string[]>(client.scopes ?? [])
    const [grantTypes, setGrantTypes] = useState<string[]>(client.grantTypes ?? [])
    const [skipConsent, setSkipConsent] = useState(client.skipConsent ?? false)
    const [enableEndSession, setEnableEndSession] = useState(client.enableEndSession ?? false)
    const [requirePKCE, setRequirePKCE] = useState(client.requirePKCE ?? false)
    const [isPublic, setIsPublic] = useState(client.public ?? false)
    const [disabled, setDisabled] = useState(client.disabled ?? false)
    const [tos, setTos] = useState(client.tos ?? "")
    const [policy, setPolicy] = useState(client.policy ?? "")
    const [contacts, setContacts] = useState((client.contacts ?? []).join(", "))

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showRotateDialog, setShowRotateDialog] = useState(false)
    const [newSecret, setNewSecret] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [secretVisible, setSecretVisible] = useState(false)

    async function copyToClipboard(value: string, field: string) {
        await navigator.clipboard.writeText(value)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    function toggleScope(scope: string) {
        setScopes((prev) =>
            prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
        )
    }

    function toggleGrantType(gt: string) {
        setGrantTypes((prev) =>
            prev.includes(gt) ? prev.filter((g) => g !== gt) : [...prev, gt],
        )
    }

    function handleSave() {
        if (redirectUris.length === 0) {
            toast.error("At least one redirect URI is required")
            return
        }
        startTransition(async () => {
            try {
                await updateClient(client.id, {
                    name: name || null,
                    uri: uri || null,
                    icon: icon || null,
                    redirectUris,
                    scopes: scopes.length > 0 ? scopes : null,
                    grantTypes: grantTypes.length > 0 ? grantTypes : null,
                    skipConsent,
                    enableEndSession,
                    requirePKCE,
                    isPublic,
                    disabled,
                    tos: tos || null,
                    policy: policy || null,
                    contacts: contacts
                        ? contacts.split(",").map((c) => c.trim()).filter(Boolean)
                        : null,
                })
                toast.success("Client updated")
                router.refresh()
            } catch {
                toast.error("Failed to update client")
            }
        })
    }

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteClient(client.id)
                toast.success("Client deleted")
                router.push("/admin/clients")
            } catch {
                toast.error("Failed to delete client")
            }
        })
    }

    function handleRotate() {
        startTransition(async () => {
            try {
                const result = await rotateClientSecret(client.clientId)
                setNewSecret(result.clientSecret)
                setShowRotateDialog(false)
                toast.success("Client secret rotated")
            } catch {
                toast.error("Failed to rotate secret")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/clients">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {client.name || "Unnamed Client"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-muted-foreground">{client.clientId}</code>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(client.clientId, "clientId")}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {copiedField === "clientId" ? (
                                <Check className="size-3.5" />
                            ) : (
                                <Copy className="size-3.5" />
                            )}
                        </button>
                        {disabled ? (
                            <Badge variant="destructive">Disabled</Badge>
                        ) : (
                            <Badge variant="secondary">Active</Badge>
                        )}
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Separator />

            {newSecret && (
                <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">New Client Secret</CardTitle>
                        <CardDescription>
                            Copy this secret now — it cannot be retrieved later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 text-sm font-mono">
                                {secretVisible ? newSecret : "••••••••••••••••••••"}
                            </code>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => setSecretVisible((v) => !v)}
                            >
                                {secretVisible ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => copyToClipboard(newSecret, "newSecret")}
                            >
                                {copiedField === "newSecret" ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Application Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My App"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="uri">Application URL</Label>
                            <Input
                                id="uri"
                                value={uri}
                                onChange={(e) => setUri(e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon URL</Label>
                            <Input
                                id="icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="https://example.com/icon.png"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Behavior */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Behavior</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Skip Consent</Label>
                                <p className="text-xs text-muted-foreground">
                                    Bypass the user consent screen
                                </p>
                            </div>
                            <Switch checked={skipConsent} onCheckedChange={setSkipConsent} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Enable End Session</Label>
                                <p className="text-xs text-muted-foreground">
                                    Allow RP-initiated logout
                                </p>
                            </div>
                            <Switch checked={enableEndSession} onCheckedChange={setEnableEndSession} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Require PKCE</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enforce Proof Key for Code Exchange
                                </p>
                            </div>
                            <Switch checked={requirePKCE} onCheckedChange={setRequirePKCE} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Public Client</Label>
                                <p className="text-xs text-muted-foreground">
                                    No client secret required
                                </p>
                            </div>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Disabled</Label>
                                <p className="text-xs text-muted-foreground">
                                    Block all authorization requests
                                </p>
                            </div>
                            <Switch checked={disabled} onCheckedChange={setDisabled} />
                        </div>
                    </CardContent>
                </Card>

                {/* OAuth Config */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">OAuth Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Redirect URIs</Label>
                            <RedirectUriInput value={redirectUris} onChange={setRedirectUris} />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Scopes</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AVAILABLE_SCOPES.map((scope) => (
                                    <label
                                        key={scope}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={scopes.includes(scope)}
                                            onCheckedChange={() => toggleScope(scope)}
                                        />
                                        {scope}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Grant Types</Label>
                            <div className="space-y-2">
                                {GRANT_TYPES.map((gt) => (
                                    <label
                                        key={gt}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={grantTypes.includes(gt)}
                                            onCheckedChange={() => toggleGrantType(gt)}
                                        />
                                        {gt.replace(/_/g, " ")}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Legal & Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Legal & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contacts">
                                Contact Emails{" "}
                                <span className="font-normal text-muted-foreground">(comma-separated)</span>
                            </Label>
                            <Input
                                id="contacts"
                                value={contacts}
                                onChange={(e) => setContacts(e.target.value)}
                                placeholder="admin@example.com, dev@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tos">Terms of Service URL</Label>
                            <Input
                                id="tos"
                                value={tos}
                                onChange={(e) => setTos(e.target.value)}
                                placeholder="https://example.com/terms"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="policy">Privacy Policy URL</Label>
                            <Input
                                id="policy"
                                value={policy}
                                onChange={(e) => setPolicy(e.target.value)}
                                placeholder="https://example.com/privacy"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {!client.public && (
                        <Button
                            variant="outline"
                            onClick={() => setShowRotateDialog(true)}
                            disabled={isPending}
                        >
                            <RotateCcw className="mr-2 size-4" />
                            Rotate Secret
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isPending}
                    >
                        <Trash2 className="mr-2 size-4" />
                        Delete Client
                    </Button>
                </CardContent>
            </Card>

            {/* Rotate Secret Confirmation */}
            <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rotate Client Secret</DialogTitle>
                        <DialogDescription>
                            This will generate a new secret and invalidate the current one.
                            All applications using the old secret will need to be updated.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRotateDialog(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleRotate} disabled={isPending}>
                            {isPending ? "Rotating..." : "Rotate Secret"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{client.name || "this client"}</strong>? This action
                            cannot be undone and will revoke all associated tokens.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
