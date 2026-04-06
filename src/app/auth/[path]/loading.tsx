export default function AuthLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="relative flex items-center justify-center">
                <span className="absolute size-10 animate-ping rounded-full bg-primary/20" />
                <span className="absolute size-10 animate-pulse rounded-full bg-primary/30" />
                <span className="size-4 rounded-full bg-primary" />
            </div>
        </div>
    )
}
