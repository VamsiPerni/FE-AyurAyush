import { CardSkeleton, TableSkeleton, Skeleton } from "./Skeleton";

const LoadingSkeleton = ({ type = "card", count = 1 }) => {
    if (type === "card") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (type === "table") {
        return <TableSkeleton rows={count} columns={4} />;
    }

    if (type === "chat") {
        return (
            <div className="space-y-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                    >
                        <div
                            className={`rounded-2xl p-4 max-w-[70%] ${
                                i % 2 === 0
                                    ? "bg-neutral-200"
                                    : "bg-primary-100"
                            }`}
                        >
                            <Skeleton className="h-3 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "detail") {
        return (
            <div className="bg-white rounded-xl border border-neutral-100 p-6">
                <Skeleton className="h-6 w-1/3 mb-6" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                </div>
                <Skeleton className="h-32" />
            </div>
        );
    }

    return null;
};

export { LoadingSkeleton };
export default LoadingSkeleton;
