import { useState } from "react";
import { useNavigate } from "react-router";
import { useChatbot } from "../../hooks/useChatbot";
import { ChatInterface } from "../../components/patient/ChatInterface";
import { BookingModal } from "../../components/patient/BookingModal";
import { AISummaryViewer } from "../../components/doctor/AISummaryViewer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import {
    MessageSquare,
    CalendarPlus,
    RotateCcw,
    Stethoscope,
} from "lucide-react";

const ChatbotPage = () => {
    const navigate = useNavigate();
    const {
        conversationId,
        messages,
        summary,
        loading,
        sending,
        isEmergency,
        status,
        restoring,
        startConversation,
        sendMessage,
        endConversation,
        resetChat,
    } = useChatbot();

    const [showBooking, setShowBooking] = useState(false);

    const handleStart = async () => {
        await startConversation();
    };

    const handleBooked = () => {
        setShowBooking(false);
        resetChat();
        navigate("/patient/appointments");
    };

    // Loading: restoring a saved conversation from sessionStorage
    if (restoring) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <LoadingSkeleton type="chat" count={4} />
            </div>
        );
    }

    // Not started yet — no active conversation
    if (!conversationId && !summary) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Card className="text-center py-12">
                    <div className="w-20 h-20 bg-[#065A82]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={36} className="text-[#065A82]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        AI Medical Assistant
                    </h1>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Describe your symptoms to our AI assistant. It will
                        analyze them and help you book an appointment with the
                        right specialist.
                    </p>
                    <Button size="lg" onClick={handleStart} loading={loading}>
                        Start Consultation
                    </Button>
                </Card>
            </div>
        );
    }

    // Chat completed with summary — show summary + Book Appointment button
    if (status === "completed" && summary) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">
                        Consultation Summary
                    </h1>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            resetChat();
                        }}
                    >
                        <RotateCcw size={16} /> New Consultation
                    </Button>
                </div>

                <AISummaryViewer summary={summary} />

                {/* Book Appointment section — prominently displayed */}
                <Card className="border-2 border-[#02C39A]/30 bg-[#02C39A]/5">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-2">
                        <div className="w-14 h-14 bg-[#02C39A]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope size={24} className="text-[#02C39A]" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold text-gray-900">
                                Ready to Book an Appointment?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Based on your symptoms, we recommend seeing a{" "}
                                <strong className="text-[#065A82]">
                                    {summary.recommendedSpecialist ||
                                        "specialist"}
                                </strong>
                                .
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => setShowBooking(true)}
                            className="bg-[#02C39A] hover:bg-[#02C39A]/90 flex-shrink-0"
                        >
                            <CalendarPlus size={18} /> Book Appointment
                        </Button>
                    </div>
                </Card>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/patient/book-appointment")}
                    >
                        Browse All Doctors
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/patient/appointments")}
                    >
                        View My Appointments
                    </Button>
                </div>

                <BookingModal
                    isOpen={showBooking}
                    onClose={() => setShowBooking(false)}
                    conversationId={conversationId}
                    summary={summary}
                    onBooked={handleBooked}
                />
            </div>
        );
    }

    // Active chat
    return (
        <div className="max-w-3xl mx-auto px-4 py-4 h-[calc(100vh-80px)]">
            <ChatInterface
                messages={messages}
                onSend={sendMessage}
                sending={sending}
                isEmergency={isEmergency}
                onEnd={endConversation}
                status={status}
                loading={loading}
            />
        </div>
    );
};

export { ChatbotPage };
