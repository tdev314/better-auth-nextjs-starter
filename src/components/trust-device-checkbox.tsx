"use client"

import { useEffect, useRef } from "react"

export function TrustDeviceCheckbox() {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const form = document.querySelector<HTMLFormElement>(
            "form[method='POST']"
        )
        if (!form) return

        const formCheckbox = form.querySelector<HTMLButtonElement>(
            "[role='checkbox']"
        )
        if (!formCheckbox) return

        const sync = () => {
            if (!ref.current) return
            const checked = ref.current.checked
            const isPressed = formCheckbox.getAttribute("data-state") === "checked"
            if (checked !== isPressed) formCheckbox.click()
        }

        ref.current?.addEventListener("change", sync)
        return () => ref.current?.removeEventListener("change", sync)
    }, [])

    return (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
                ref={ref}
                type="checkbox"
                className="size-4 rounded border accent-primary"
            />
            <span>Trust this device for 30 days</span>
        </label>
    )
}
