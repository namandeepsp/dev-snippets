import { Skeleton } from "../design-system";

export default function SearchResultsSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={`search-skeleton-${index}`}
                    className="rounded-lg border border-default px-3 py-2"
                >
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-3 w-1/3" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}