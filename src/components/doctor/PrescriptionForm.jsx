import { useState } from 'react';
import { Plus, Trash2, Pill, ScrollText, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const defaultMedication = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: ''
};

const PrescriptionForm = ({ onSubmit, loading }) => {
  const [medications, setMedications] = useState([{ ...defaultMedication }]);
  const [notes, setNotes] = useState('');

  const handleMedChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const addMedication = () => {
    setMedications(prev => [...prev, { ...defaultMedication }]);
  };

  const removeMedication = (index) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // basic validation
    const validMeds = medications.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0 && !notes.trim()) {
      alert("Please add at least one medication or some clinical notes.");
      return;
    }
    onSubmit({ medications: validMeds, notes });
  };

  return (
    <Card className="border-primary-100 dark:border-dark-border shadow-sm overflow-visible">
      <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-50 dark:border-dark-border flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-primary-800 dark:text-primary-400">
          <Pill className="w-5 h-5" />
          Digital Prescription
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="divide-y divide-neutral-100 dark:divide-dark-border">
          {/* Medications Array */}
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight text-sm">Medications</h3>
              <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addMedication}>
                Add Medication
              </Button>
            </div>
            
            <div className="space-y-4">
              {medications.map((med, idx) => (
                <div key={idx} className="bg-neutral-50 dark:bg-dark-elevated p-4 rounded-xl border border-neutral-200 dark:border-dark-border relative group animate-in slide-in-from-top-2">
                  <div className="absolute -top-3 left-4 bg-white dark:bg-dark-elevated px-2 text-xs font-bold text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-dark-border rounded-full">
                    #{idx + 1}
                  </div>
                  {medications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedication(idx)}
                      className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="md:col-span-2">
                      <Input 
                        label="Medication Name" 
                        value={med.name} 
                        onChange={e => handleMedChange(idx, 'name', e.target.value)} 
                        placeholder="e.g. Paracetamol 500mg" 
                        required 
                      />
                    </div>
                    <Input 
                      label="Dosage" 
                      value={med.dosage} 
                      onChange={e => handleMedChange(idx, 'dosage', e.target.value)} 
                      placeholder="e.g. 1 Tablet" 
                    />
                    <Input 
                      label="Frequency" 
                      value={med.frequency} 
                      onChange={e => handleMedChange(idx, 'frequency', e.target.value)} 
                      placeholder="e.g. Twice a day (Morning, Night)" 
                    />
                    <Input 
                      label="Duration" 
                      value={med.duration} 
                      onChange={e => handleMedChange(idx, 'duration', e.target.value)} 
                      placeholder="e.g. 5 Days" 
                    />
                    <Input 
                      label="Instructions" 
                      value={med.instructions} 
                      onChange={e => handleMedChange(idx, 'instructions', e.target.value)} 
                      placeholder="e.g. After food" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-dark-card">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight flex items-center gap-2 text-sm">
              <ScrollText className="w-4 h-4 text-neutral-500" />
              Doctor's Notes
            </h3>
            <textarea
              className="w-full resize-y min-h-[120px] bg-neutral-50 dark:bg-dark-elevated border border-neutral-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-shadow"
              placeholder="Add dietary restrictions, follow-up instructions, or general clinical notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Action */}
          <div className="p-4 sm:p-6 bg-neutral-50/50 dark:bg-dark-elevated/50 flex justify-end">
            <Button type="submit" loading={loading} icon={Check} className="w-full sm:w-auto">
              Complete Appointment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { PrescriptionForm };
export default PrescriptionForm;
