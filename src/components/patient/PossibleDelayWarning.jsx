import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Siren, ChevronRight } from 'lucide-react';
import { patientService } from '../../services/patientService';

const PossibleDelayWarning = ({ doctorId }) => {
    const [delayInfo, setDelayInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!doctorId) return;

        const fetchDelayStatus = async () => {
            try {
                const response = await patientService.getEmergencyDelayForDoctor(doctorId);
                if (response.isSuccess && response.data) {
                    setDelayInfo(response.data);
                } else {
                    setDelayInfo(null);
                }
            } catch (error) {
                console.error('Failed to fetch doctor delay status:', error);
            }
        };

        fetchDelayStatus();
        const interval = setInterval(fetchDelayStatus, 20000); // 20s polling for patients
        return () => clearInterval(interval);
    }, [doctorId]);

    if (!delayInfo) return null;

    return (
        <div className="mb-6 animate-in slide-in-from-top duration-500">
            <div className="relative overflow-hidden bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 shadow-sm group">
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-200/20 dark:bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-200/30 transition-colors" />
                
                <div className="flex items-start gap-4 relative z-10">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 animate-pulse">
                        <Siren className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Possible Delay Expected
                            </h3>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80 bg-white/50 dark:bg-dark-surface/50 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-700/30">
                                Doctor handling emergency
                            </span>
                        </div>
                        
                        <p className="text-sm text-amber-700/90 dark:text-amber-400/90 font-medium leading-relaxed mb-3">
                            Dr. {delayInfo.doctorName} is currently attending to a critical emergency. 
                            Your appointment may be delayed.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-600/70 dark:text-amber-500/70">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Started: {new Date(delayInfo.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/20">
                                Status: Your token is secure
                            </div>
                        </div>
                    </div>
                </div>
                
                <button className="hidden sm:flex absolute right-4 bottom-4 items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-tighter hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                    Queue Details <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default PossibleDelayWarning;
