import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Pill, Stethoscope, Search, FileText, Plus, X } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { doctorService } from "../../services/doctorService";
import { CardSkeleton } from "../../components/ui/Skeleton";

// Hardcoded references to simulate a DB-driven clinical library
const CLINICAL_LIBRARY = {
    Ayurveda: {
        medications: [
            { name: "Ashwagandha Churna", usage: "Stress reduction, immune support", dosage: "1-2 tsp twice daily with warm milk" },
            { name: "Triphala", usage: "Digestive health, detoxification", dosage: "1 tsp before bed with warm water" },
            { name: "Shatavari", usage: "Reproductive health, vitality", dosage: "1 tsp daily with warm milk" }
        ],
        procedures: [
            { name: "Panchakarma", description: "Five-fold detoxification therapy. Use when severe ama buildup is detected.", duration: "7-21 days" },
            { name: "Shirodhara", description: "Pouring warm liquid on the forehead. Excellent for chronic stress and insomnia.", duration: "45-60 mins" }
        ],
        bestPractices: [
            "Always assess Prakriti (body constitution) before modifying diet.",
            "Recommend drinking warm water throughout the day to support Agni.",
            "Instruct patients on daily routines (Dinacharya) to prevent Dosha imbalances."
        ]
    },
    General: {
        medications: [
            { name: "Paracetamol", usage: "Pain relief, fever reduction", dosage: "500-1000mg every 4-6 hours" },
            { name: "Ibuprofen", usage: "Anti-inflammatory, pain relief", dosage: "200-400mg every 4-6 hours" }
        ],
        procedures: [
            { name: "Standard Vitals Assessment", description: "Blood pressure, heart rate, temperature, SpO2 monitoring.", duration: "5 mins" },
            { name: "Basic Wound Care", description: "Cleaning, disinfecting, and dressing minor abrasions.", duration: "10 mins" }
        ],
        bestPractices: [
            "Use the SOAP (Subjective, Objective, Assessment, Plan) format for notes.",
            "Empathetic listening dramatically improves patient adherence.",
            "Follow strict hand hygiene protocols between patient consultations."
        ]
    }
};

const TreatmentReferencePage = () => {
    const [loading, setLoading] = useState(true);
    const [baseSpecialization, setBaseSpecialization] = useState("General");
    const [exactSpecialization, setExactSpecialization] = useState("General");
    const [activeTab, setActiveTab] = useState("medications");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Custom Library State
    const [customLibrary, setCustomLibrary] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", usage: "", dosage: "", description: "", duration: "" });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [dashboard, referencesObj] = await Promise.all([
                    doctorService.getDashboard(),
                    doctorService.getCustomReferences()
                ]);
                
                if (referencesObj) {
                    setCustomLibrary(referencesObj.data || referencesObj || {});
                }
                
                if (dashboard && dashboard.data && dashboard.data.specialization) {
                    const actualSpec = dashboard.data.specialization;
                    setExactSpecialization(actualSpec);
                    const baseSpec = actualSpec.includes("Ayurveda") ? "Ayurveda" : "General";
                    setBaseSpecialization(baseSpec);
                }
            } catch (err) {
                console.error("Failed to load clinical library dependencies", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleAddReference = async (e) => {
        e.preventDefault();
        
        // Use a local loading indicator if desired, for now we will just disable button
        // or just let it process
        
        let itemToAdd = {};
        if (activeTab === "medications") {
            itemToAdd = { name: newItem.name, usage: newItem.usage, dosage: newItem.dosage, isCustom: true };
        } else if (activeTab === "procedures") {
            itemToAdd = { name: newItem.name, description: newItem.description, duration: newItem.duration, isCustom: true };
        } else if (activeTab === "bestPractices") {
            itemToAdd = { text: newItem.description, isCustom: true };
        }

        try {
            const updatedRefs = await doctorService.addCustomReference(activeTab, itemToAdd);
            setCustomLibrary(updatedRefs?.data || updatedRefs || {});
            
            setNewItem({ name: "", usage: "", dosage: "", description: "", duration: "" });
            setIsAdding(false);
        } catch (err) {
            console.error("Failed to add custom reference", err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
                <PageHeader title="Clinical Reference Library" subtitle="Loading databases..." />
                <CardSkeleton count={2} />
            </div>
        );
    }

    const baseLibraryContent = CLINICAL_LIBRARY[baseSpecialization]?.[activeTab] || CLINICAL_LIBRARY.General?.[activeTab] || [];
    const customLibraryContent = customLibrary[exactSpecialization]?.[activeTab] || [];
    
    // Normalize strings vs objects for best practices comparison
    const combinedContent = [
        ...baseLibraryContent.map(item => typeof item === 'string' ? { text: item, isCustom: false } : { ...item, isCustom: false }),
        ...customLibraryContent.map(item => typeof item === 'string' ? { text: item, isCustom: true } : item)
    ];
    
    const filteredContent = combinedContent.filter(item => {
        if (!searchQuery) return true;
        
        const q = searchQuery.toLowerCase();
        if (item.text) return item.text.toLowerCase().includes(q);
        return item.name?.toLowerCase().includes(q) || 
               item.usage?.toLowerCase().includes(q) || 
               item.description?.toLowerCase().includes(q);
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageHeader
                    title="Intelligent Treatment Reference"
                    subtitle={`Clinical Library • ${exactSpecialization} Protocols`}
                    action={
                        <Button onClick={() => setIsAdding(!isAdding)} icon={isAdding ? X : Plus} variant="primary">
                            {isAdding ? "Cancel" : "Add Resource"}
                        </Button>
                    }
                />
                
                <div className="relative mb-2 md:mb-0 w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2.5 w-full bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-neutral-50/50 dark:bg-dark-elevated p-1.5 rounded-2xl border border-neutral-200 dark:border-dark-border flex items-center justify-between shadow-xs max-w-fit overflow-x-auto">
                <div className="flex space-x-1">
                    {[
                        { id: "medications", label: "Medications Frame", icon: Pill },
                        { id: "procedures", label: "Standard Protocols", icon: Stethoscope },
                        { id: "bestPractices", label: "Best Practices", icon: Sparkles }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setIsAdding(false); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                                activeTab === tab.id
                                    ? "bg-white dark:bg-dark-card text-primary-700 dark:text-primary-400 shadow-sm ring-1 ring-neutral-200 dark:ring-dark-border"
                                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-dark-hover"
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary-600 dark:text-primary-400" : ""}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {isAdding && (
                <Card className="border-primary-200 dark:border-primary-900 shadow-md animate-in slide-in-from-top-4">
                    <CardHeader className="bg-primary-50/50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30">
                        <CardTitle className="text-primary-900 dark:text-primary-100 text-base">
                            Add Custom Resource • {activeTab === "medications" ? "Medication" : activeTab === "procedures" ? "Protocol" : "Best Practice"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <form onSubmit={handleAddReference} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTab === "medications" && (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Medication Name</label>
                                        <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="e.g. Paracetamol" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Primary Usage</label>
                                        <input required type="text" value={newItem.usage} onChange={e => setNewItem({...newItem, usage: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="e.g. Fever reduction" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Dosage Recommendations</label>
                                        <input required type="text" value={newItem.dosage} onChange={e => setNewItem({...newItem, dosage: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="e.g. 500mg every 6 hours" />
                                    </div>
                                </>
                            )}
                            {activeTab === "procedures" && (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Protocol / Procedure Name</label>
                                        <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="e.g. Vitals Check" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Description & Details</label>
                                        <input required type="text" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="Detail the steps clearly." />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Estimated Duration</label>
                                        <input required type="text" value={newItem.duration} onChange={e => setNewItem({...newItem, duration: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="e.g. 5 mins" />
                                    </div>
                                </>
                            )}
                            {activeTab === "bestPractices" && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Practice Description</label>
                                    <textarea required rows={3} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full px-3 py-2 bg-neutral-50 dark:bg-dark-elevated rounded-lg border border-neutral-200 dark:border-dark-border text-sm" placeholder="Describe the recommended clinical behavior..." />
                                </div>
                            )}
                            
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <Button type="submit" variant="primary" icon={Plus}>Save to My Library</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-dark-card rounded-2xl border border-neutral-200 dark:border-dark-border shadow-sm">
                        <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">No matches found</h3>
                        <p className="text-neutral-500">Try adjusting your search criteria in the {activeTab} library.</p>
                    </div>
                ) : (
                    activeTab === "medications" ? (
                        filteredContent.map((med, idx) => (
                            <Card key={idx} className={`hover:-translate-y-1 transition-transform duration-300 shadow-xs hover:shadow-md overflow-hidden ${med.isCustom ? 'border-sky-200 dark:border-sky-900/50' : 'border-primary-100 dark:border-primary-900/30'}`}>
                                <div className={`h-1 w-full ${med.isCustom ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : 'bg-gradient-to-r from-primary-400 to-emerald-500'}`} />
                                <CardHeader className="pb-3 border-b border-neutral-50 dark:border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg text-primary-900 dark:text-primary-100 leading-tight flex items-center gap-2">
                                            {med.name}
                                            {med.isCustom && <Badge type="status" value="Custom" />}
                                        </CardTitle>
                                        <Badge variant="primary" className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shrink-0">Rx</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Primary Usage</p>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{med.usage}</p>
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-dark-elevated rounded-lg p-3 border border-neutral-100 dark:border-dark-border">
                                        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                            <Pill className="w-3 h-3" /> Recommended Dosage
                                        </p>
                                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{med.dosage}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : activeTab === "procedures" ? (
                        filteredContent.map((proc, idx) => (
                            <Card key={idx} className={`hover:-translate-y-1 transition-transform duration-300 shadow-xs hover:shadow-md overflow-hidden ${proc.isCustom ? 'border-sky-200 dark:border-sky-900/50' : 'border-indigo-100 dark:border-indigo-900/30'}`}>
                                <div className={`h-1 w-full ${proc.isCustom ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`} />
                                <CardHeader className="pb-3 border-b border-neutral-50 dark:border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100 leading-tight flex items-center gap-2">
                                            {proc.name}
                                            {proc.isCustom && <Badge type="status" value="Custom" />}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Procedure Detail</p>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{proc.description}</p>
                                    </div>
                                    <div className="inline-block bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                                        Estimated Duration: {proc.duration}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full border-amber-100 dark:border-amber-900/30 overflow-hidden shadow-sm">
                             <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 w-full" />
                             <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100/50 dark:border-amber-900/30">
                                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Clinical Best Practices ({exactSpecialization})
                                </CardTitle>
                             </CardHeader>
                             <CardContent className="p-0">
                                <ul className="divide-y divide-neutral-100 dark:divide-dark-border">
                                    {filteredContent.map((practice, idx) => (
                                        <li key={idx} className="p-5 flex gap-4 hover:bg-neutral-50/50 dark:hover:bg-dark-hover transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold shadow-sm border border-amber-200 dark:border-amber-800/50">
                                                {idx + 1}
                                            </div>
                                            <div className="pt-1 w-full">
                                                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed flex items-start justify-between w-full">
                                                    {practice.text}
                                                    {practice.isCustom && <Badge type="status" value="Custom" className="shrink-0 ml-2" />}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                             </CardContent>
                        </Card>
                    )
                )}
            </div>
        </div>
    );
};

export { TreatmentReferencePage };
export default TreatmentReferencePage;
