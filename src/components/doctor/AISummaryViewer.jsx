import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  Brain,
  Activity,
  Thermometer,
  UserCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";

const AISummaryViewer = ({ summary, className = "" }) => {
  if (!summary) return null;

  const getSeverityColor = (severity) => {
    if (severity <= 3) return "bg-green-500";
    if (severity <= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getUrgencyVariant = (level) => {
    if (level === "emergency") return "emergency";
    if (level === "urgent") return "warning";
    return "success";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={18} className="text-[#065A82]" />
          AI Medical Summary
        </CardTitle>
      </CardHeader>

      <div className="space-y-4">
        {/* Urgency & Severity */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">Urgency:</span>
            <Badge variant={getUrgencyVariant(summary.urgencyLevel)}>
              {summary.urgencyLevel?.toUpperCase()}
            </Badge>
          </div>

          {summary.severity && (
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Activity size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">Severity:</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getSeverityColor(summary.severity)}`}
                    style={{ width: `${summary.severity * 10}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {summary.severity}/10
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Symptoms */}
        {summary.symptoms?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Thermometer size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Symptoms
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.symptoms.map((s, i) => (
                <span
                  key={i}
                  className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        {summary.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Duration:</span>
            <span>{summary.duration}</span>
          </div>
        )}

        {/* Recommended Specialist */}
        {summary.recommendedSpecialist && (
          <div className="flex items-center gap-2 bg-[#065A82]/5 p-3 rounded-lg">
            <UserCheck size={16} className="text-[#065A82]" />
            <span className="text-sm text-gray-600">
              Recommended Specialist:
            </span>
            <span className="text-sm font-semibold text-[#065A82]">
              {summary.recommendedSpecialist}
            </span>
          </div>
        )}

        {/* Detailed Summary */}
        {summary.detailedSummary && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Detailed Summary
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
              {summary.detailedSummary}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export { AISummaryViewer };
