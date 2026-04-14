import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Activity, ShieldAlert, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Badge } from '../ui/Badge';

const EmergencyDelayBanner = () => {
    const [delays, setDelays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDelays = async () => {
        try {
            const response = await adminService.getEmergencyDelays();
            if (response.isSuccess) {
                setDelays(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch emergency delays:', error);
        }
    };

    useEffect(() => {
        fetchDelays();
        // Poll every 30 seconds for admin
        const interval = setInterval(fetchDelays, 30000);
        return () => clearInterval(interval);
    }, []);

    if (delays.length === 0) return null;

    return (
        <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">
                    Critical System Alerts ({delays.length})
                </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {delays.map((delay) => (
                    <div 
                        key={delay.doctorId}
                        className="relative group overflow-hidden bg-white dark:bg-dark-card rounded-2xl border-2 border-red-500/20 dark:border-red-500/10 shadow-lg shadow-red-500/5 transition-all hover:border-red-500/40"
                    >
                        {/* Status Pulse Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
                        
                        <div className="p-4 flex gap-4 relative z-10">
                            {/* Doctor Icon/initial */}
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                <Activity className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100 truncate">
                                        Dr. {delay.doctorName}
                                    </h4>
                                    <Badge variant="danger" className="animate-pulse">Emergency Mode</Badge>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    Activated: {new Date(delay.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                <div className="bg-red-50/50 dark:bg-red-900/5 rounded-lg p-2.5 border border-red-100/50 dark:border-red-900/20">
                                    <p className="text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
                                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                                        {delay.reason}
                                    </p>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                                    <span className="text-red-600/80 dark:text-red-400/80 italic">
                                        Patients are being rerouted
                                    </span>
                                    <button className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 transition-colors">
                                        View Details <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyDelayBanner;
