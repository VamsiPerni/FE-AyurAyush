import { Sparkles, AlertTriangle } from "lucide-react";

const AISummaryViewer = ({ summary, className = "" }) => {
    if (!summary) return null;

    const {
        symptoms = [],
        severity = 0,
        urgencyLevel = "normal",
        recommendedSpecialist = "",
        detailedSummary,
    } = summary;

    const numericSeverity = Number.isFinite(Number(severity))
        ? Math.max(0, Math.min(10, Number(severity)))
        : 0;
    const isUrgent = urgencyLevel === "emergency" || numericSeverity >= 8;
    const barColor =
        numericSeverity >= 8
            ? "from-red-400 to-red-600"
            : numericSeverity >= 5
              ? "from-amber-400 to-orange-500"
              : "from-green-400 to-emerald-500";

    return (
        <div
            className={`rounded-xl p-5 border ${isUrgent ? "bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-red-200 dark:border-red-700/40" : "bg-linear-to-br from-primary-50 to-emerald-50 dark:from-primary-900/10 dark:to-emerald-900/10 border-primary-100 dark:border-primary-700/40"} ${className}`}
        >
            <div className="flex items-center gap-2 mb-4">
                {isUrgent ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                    <Sparkles className="w-4 h-4 text-primary-600" />
                )}
                <h3
                    className={`text-sm font-semibold ${isUrgent ? "text-red-800 dark:text-red-400" : "text-primary-800 dark:text-primary-300"}`}
                >
                    AI Pre-Consultation Summary
                </h3>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">
                    <span className="font-medium">Severity Score</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {numericSeverity}/10
                    </span>
                </div>
                <div className="h-2.5 bg-white/80 dark:bg-dark-elevated rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-linear-to-r ${barColor} transition-all duration-500`}
                        style={{ width: `${numericSeverity * 10}%` }}
                    />
                </div>
            </div>

            {symptoms.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                        Reported Symptoms
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {symptoms.map((symptom, index) => (
                            <span
                                key={`${symptom}-${index}`}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/90 dark:bg-dark-elevated border border-neutral-200 dark:border-dark-border text-neutral-700 dark:text-neutral-300"
                            >
                                {symptom}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 dark:bg-dark-elevated rounded-lg p-3">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">
                        Urgency
                    </p>
                    <p
                        className={`text-sm font-bold ${urgencyLevel === "emergency" ? "text-red-700 dark:text-red-400" : "text-neutral-800 dark:text-neutral-200"}`}
                    >
                        {urgencyLevel}
                    </p>
                </div>
                <div className="bg-white/80 dark:bg-dark-elevated rounded-lg p-3">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">
                        Specialist
                    </p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {recommendedSpecialist || "General"}
                    </p>
                </div>
            </div>

            {detailedSummary && (
                <div className="mt-4 bg-white/60 dark:bg-dark-elevated rounded-lg p-3">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">
                        Summary
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {detailedSummary}
                    </p>
                </div>
            )}
        </div>
    );
};

export { AISummaryViewer };
