import React, { useState } from 'react';
import { AlertCircle, Clock, XCircle, ShieldCheck, Siren } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { doctorService } from '../../services/doctorService';
import { toast } from 'react-toastify';

const EmergencyDelayToggle = ({ emergencyState, onStatusChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isActive = emergencyState?.isActive || false;

    const handleActivate = async () => {
        if (!reason.trim()) {
            toast.warning('Please provide a reason for the emergency delay');
            return;
        }

        setIsLoading(true);
        try {
            const response = await doctorService.activateEmergencyDelay(reason);
            if (response.isSuccess) {
                toast.success('Emergency mode activated. Patients are being notified.');
                if (onStatusChange) onStatusChange(response.data);
                setIsModalOpen(false);
                setReason('');
            }
        } catch (error) {
            console.error('Failed to activate emergency mode:', error);
            toast.error('Failed to activate emergency mode. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        setIsLoading(true);
        try {
            const response = await doctorService.deactivateEmergencyDelay();
            if (response.isSuccess) {
                toast.success('Emergency mode deactivated. Returning to normal operations.');
                if (onStatusChange) onStatusChange(response.data);
            }
        } catch (error) {
            console.error('Failed to deactivate emergency mode:', error);
            toast.error('Failed to deactivate emergency mode. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-6">
            {!isActive ? (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-neutral-100 dark:border-dark-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Queue Status Management</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Handle emergencies and notify waiting patients of expected delays.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        variant="secondary"
                        className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 w-full sm:w-auto"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Activate Emergency Mode
                    </Button>
                </div>
            ) : (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse shadow-lg shadow-red-500/20">
                                <Siren className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                        Emergency Mode Active
                                    </h3>
                                    <Badge variant="danger" className="animate-pulse">Live Warning</Badge>
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-300 font-medium max-w-xl">
                                    Reason: {emergencyState.reason || 'Handling a critical case'}
                                </p>
                                <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-1 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Patients are receiving real-time delay notifications. Their tokens remain secure.
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleDeactivate}
                            isLoading={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 w-full sm:w-auto"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Resolve & Clear Warning
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Activate Emergency Mode"
                description="This will notify all waiting patients and the reception team of a delay."
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleActivate} 
                            isLoading={isLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Confirm Emergency Mode
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Reason for Delay
                        </label>
                        <Input
                            placeholder="e.g., Critical emergency in Ward B, Urgent surgery required..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            This message will be shown to patients waiting in your queue.
                        </p>
                    </div>
                    
                    <div className="bg-neutral-50 dark:bg-dark-surface p-3 rounded-xl border border-neutral-100 dark:border-dark-border">
                        <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            System Impact
                        </h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5">
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                                Patient dashboard will show a "Possible Delay Expected" warning.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                                Reception/Admin dash will show a high-priority warning banner.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                                Patient tokens remain active and secure in the queue.
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmergencyDelayToggle;
