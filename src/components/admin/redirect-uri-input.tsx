"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RedirectUriInputProps {
    value: string[]
    onChange: (uris: string[]) => void
}

export function RedirectUriInput({ value, onChange }: RedirectUriInputProps) {
    const [draft, setDraft] = useState("")

    function add() {
        const uri = draft.trim()
        if (!uri || value.includes(uri)) return
        onChange([...value, uri])
        setDraft("")
    }

    function remove(uri: string) {
        onChange(value.filter((u) => u !== uri))
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="https://example.com/callback"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            add()
                        }
                    }}
                />
                <Button type="button" variant="outline" size="icon" onClick={add}>
                    <Plus className="size-4" />
                </Button>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((uri) => (
                        <Badge key={uri} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1 font-mono text-xs">
                            {uri}
                            <button
                                type="button"
                                onClick={() => remove(uri)}
                                className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
