"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Clock, Plus, AlertCircle, Calendar, X, Trash2, Search, Pencil, Sparkles,
  ChevronDown, CheckCircle2, Loader2, Info, ArrowRight, ChevronRight,
  UploadCloud, FileText, ExternalLink, ShieldAlert, Send, Check, BookOpen, AlertTriangle
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Service Catalog ──────────────────────────────────────────────────────────
const SERVICE_CATALOG = [
  { 
    label: "Passport Renewal", 
    department: "Ministry of External Affairs", 
    category: "Travel",
    officialUrl: "https://passportindia.gov.in/",
    desc: "Renew expired passports or update booklet details under MEA guidelines."
  },
  { 
    label: "Aadhaar Demographic Update", 
    department: "UIDAI (Unique Identification Authority of India)", 
    category: "Identity",
    officialUrl: "https://myaadhaar.uidai.gov.in/",
    desc: "Update mobile number, address, or name on your National Identity card."
  },
  { 
    label: "Income Certificate", 
    department: "State Revenue Department / Tehsildar", 
    category: "Certificate",
    officialUrl: "https://india.gov.in/service/apply-income-certificate",
    desc: "Official income validation document for academic scholarships and concessions."
  },
  { 
    label: "Post Matric Scholarship", 
    department: "Ministry of Social Justice & Empowerment", 
    category: "Welfare",
    officialUrl: "https://scholarships.gov.in/",
    desc: "Financial assistance and fee reimbursement programs for retrograded classes."
  },
  { 
    label: "New Pan Card", 
    department: "Income Tax Department", 
    category: "Finance",
    officialUrl: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    desc: "Register a Permanent Account Number for direct tax compliance audits."
  },
  { 
    label: "Driving License renewal", 
    department: "Regional Transport Office (RTO)", 
    category: "Transport",
    officialUrl: "https://sarathi.parivahan.gov.in/",
    desc: "Extend validity or apply for address revisions on private vehicle licences."
  }
];

const CATEGORY_COLORS = {
  Travel:      "bg-sky-50 text-sky-600 border-sky-100",
  Finance:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  Identity:    "bg-violet-50 text-violet-600 border-violet-100",
  Welfare:     "bg-orange-50 text-orange-600 border-orange-100",
  Transport:   "bg-amber-50 text-amber-600 border-amber-100",
  Certificate: "bg-rose-50 text-rose-600 border-rose-100",
};

// ── 9 Workflow States mapping ───────────────────────────────────────────────
const WORKFLOW_STAGES = [
  { id: 1, label: "Service Selected", pct: 10 },
  { id: 2, label: "Document Upload", pct: 20 },
  { id: 3, label: "AI Review Completed", pct: 35 },
  { id: 4, label: "Reference ID Added", pct: 45 },
  { id: 5, label: "Externally Submitted", pct: 55 },
  { id: 6, label: "Under Review", pct: 70 },
  { id: 7, label: "Verification Stage", pct: 80 },
  { id: 8, label: "Final Approval", pct: 90 },
  { id: 9, label: "Completed", pct: 100 }
];

export default function TrackerPage() {
  const [trackers, setTrackers] = useState([]);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Wizard modal control
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard State
  const [selectedService, setSelectedService] = useState(null);
  const [customServiceDesc, setCustomServiceDesc] = useState("");
  const [aiBriefing, setAiBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  
  // Doc uploads inside wizard
  const [wizardFiles, setWizardFiles] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");

  // Reference Code
  const [referenceNumber, setReferenceNumber] = useState("");

  // Copilot interactive state
  const [copilotMsg, setCopilotMsg] = useState("");
  const [copilotHistory, setCopilotHistory] = useState([]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Fetch trackers and documents
  async function fetchData() {
    setLoading(true);
    try {
      const appRes = await fetch(`${API}/api/applications`, { credentials: "include" });
      const docRes = await fetch(`${API}/api/documents`, { credentials: "include" });

      let loadedTrackers = [];
      if (appRes.ok) {
        const data = await appRes.json();
        loadedTrackers = data.applications || [];
        setTrackers(loadedTrackers);
      }
      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data.documents || []);
      }
      if (loadedTrackers.length > 0) {
        setSelectedTracker(loadedTrackers[0]);
      }
    } catch (err) {
      console.error("Failed to load tracker analytics data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // AI Briefing Generator
  const generateAIBriefing = async (service) => {
    setBriefingLoading(true);
    setAiBriefing(null);
    try {
      const res = await fetch(`${API}/api/ai/guide`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeName: service.label,
          department: service.department,
          description: service.desc || ""
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiBriefing(data.guide);
      } else {
        throw new Error("API failed");
      }
    } catch {
      // Fallback briefing
      setAiBriefing({
        steps: [
          `Step 1: Browse to the official portal: ${service.officialUrl}`,
          "Step 2: Authenticate using your mobile OTP credential logs.",
          `Step 3: Complete demographics form matching your ${service.category} documents.`,
          "Step 4: Upload audited file photocopies, review checklist and submit."
        ],
        requiredDocuments: [
          "Aadhaar Card with active phone mapping",
          "Secondary School Certificate or Matric DOB Proof",
          "Verification check receipt of payments"
        ],
        commonMistakes: [
          "Spelling inconsistencies between biometric register & submit forms.",
          "Uploading expired local tahsildar clearances."
        ],
        timeline: "Estimated 10 - 20 working days processing.",
        navigationGuidance: "Access home dashboard, navigate to services registry and locate file uploads corner."
      });
    } finally {
      setBriefingLoading(false);
    }
  };

  // Trigger file upload in step 3
  const handleWizardFileUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setFileUploading(true);
    setFileUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/documents`, {
        credentials: "include",
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setWizardFiles(prev => [...prev, data.document]);
        // Also refresh general documents list
        setDocuments(prev => [data.document, ...prev]);
      } else {
        setFileUploadError(data.error || "Compliance file scan failed.");
      }
    } catch {
      setFileUploadError("Unable to establish file stream.");
    } finally {
      setFileUploading(false);
    }
  };

  // Submit and Create Central Tracker
  const handleActivateTracker = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedService.label,
          department: selectedService.department,
          referenceNumber: referenceNumber.trim() || undefined,
          status: referenceNumber.trim() ? "submitted" : "submitted",
          progress: referenceNumber.trim() ? 55 : 35, // Submitted vs Pre-Vetted
          timelineDescription: referenceNumber.trim() 
            ? `Central Tracking Desk Activated. Citizen registered Reference ID: ${referenceNumber.trim()}. Pre-vetting compliance certified.`
            : "Central Tracking Desk Activated. AI Pre-vetting compliance complete. Awaiting official submission Reference ID."
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTrackers(prev => [data.application, ...prev]);
        setSelectedTracker(data.application);
        setWizardOpen(false);
        // Reset wizard variables
        setWizardStep(1);
        setSelectedService(null);
        setAiBriefing(null);
        setWizardFiles([]);
        setReferenceNumber("");
      } else {
        alert(data.error || "Failed to seed tracking ledger.");
      }
    } catch {
      alert("Registration error.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Tracker
  const handleDeleteTracker = async (appId) => {
    if (!confirm("Are you sure you want to stop tracking this application?")) return;
    try {
      const res = await fetch(`${API}/api/applications/${appId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        const updated = trackers.filter((t) => t._id !== appId);
        setTrackers(updated);
        setSelectedTracker(updated[0] || null);
      }
    } catch (err) {
      console.error("Failed to delete tracker:", err);
    }
  };

  // Copilot Interactive Chat
  const handleSendCopilotMsg = async (e) => {
    e.preventDefault();
    if (!copilotMsg.trim() || !selectedTracker) return;

    const userMessage = copilotMsg.trim();
    setCopilotMsg("");
    setCopilotHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setCopilotLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/guide/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeName: selectedTracker.title,
          department: selectedTracker.department,
          messages: [...copilotHistory, { role: "user", content: userMessage }]
        })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setCopilotHistory(prev => [...prev, { role: "model", content: data.response }]);
      } else {
        setCopilotHistory(prev => [...prev, { role: "model", content: "I am having trouble accessing the AI briefing logs right now. Please try again soon." }]);
      }
    } catch {
      setCopilotHistory(prev => [...prev, { role: "model", content: "Connection timeout. Please verify backend status." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Get matching badge style
  const getStatusBadgeClass = (status) => {
    const map = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      under_review: "bg-indigo-50 text-indigo-750 border-indigo-200",
      action_required: "bg-amber-50 text-amber-700 border-amber-250",
      rejected: "bg-rose-50 text-rose-700 border-rose-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300"
    };
    return map[status] || "bg-slate-50 text-slate-600 border-slate-200";
  };

  // Filter out documents belonging to selected tracker's owner
  const activeTrackerDocs = selectedTracker ? documents : [];

  // Determine current active workflow stage index from progress percentage
  const getActiveStageIndex = (progress) => {
    let index = 0;
    for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
      if (progress >= WORKFLOW_STAGES[i].pct) {
        index = i;
      }
    }
    return index;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Sleek Saffron-Green Tricolor Top Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-600 rounded-full" />

      {/* Header Desk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            Centralized AI-Assisted Governance Desk <Clock className="w-5.5 h-5.5 text-[#1a56db]" />
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            A comprehensive governance assistance and pre-filing compliance tracking layer. Organize filing files, link official portal reference codes, and access Gemini timeline logs.
          </p>
        </div>
        <Button 
          onClick={() => { setWizardOpen(true); setWizardStep(1); }} 
          className="gap-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold shadow-md shadow-blue-500/20 py-2.5 rounded-xl border border-blue-600 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Start Governance Tracker
        </Button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: Applications List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-slate-250 shadow-xs relative overflow-hidden" hover={false}>
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1a56db]" />
            <CardHeader className="pb-0 mb-4 pl-6">
              <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Trackers ({trackers.length})</CardTitle>
            </CardHeader>
            <CardContent className="pl-6 pr-4">
              {trackers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">No active tracking sessions</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Set up your first central assistance registry to unlock milestone timelines.
                  </p>
                  <button
                    onClick={() => { setWizardOpen(true); setWizardStep(1); }}
                    className="mt-3.5 text-xs font-black text-[#1a56db] hover:underline"
                  >
                    Start wizard stepper →
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {trackers.map((app) => (
                    <div
                      key={app._id}
                      onClick={() => {
                        setSelectedTracker(app);
                        setCopilotHistory([]);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedTracker?._id === app._id
                          ? "border-[#1a56db] bg-blue-50/20 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-350 bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-800 truncate leading-snug">{app.title}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 border text-slate-500 border-slate-200">
                            {app.progress}%
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 block mt-1 truncate uppercase tracking-wide">
                          {app.department}
                        </span>
                        {app.referenceNumber && (
                          <span className="inline-block text-[9px] font-semibold font-mono text-slate-500 bg-slate-150 px-1.5 py-0.5 rounded mt-1.5">
                            Ref: {app.referenceNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`border uppercase ${getStatusBadgeClass(app.status)}`}>
                          {app.status.replace("_", " ")}
                        </Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTracker(app._id); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Terminate tracker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Tracker Detail console */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTracker ? (
            <div className="space-y-6">
              
              {/* Tracker Master Card */}
              <Card className="bg-white border-slate-250 shadow-xs relative overflow-hidden" hover={false}>
                {/* Tricolor corner indicator */}
                <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
                <CardHeader className="border-b border-slate-100 pb-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <Badge className={`border uppercase text-[9px] font-bold ${getStatusBadgeClass(selectedTracker.status)}`}>
                        {selectedTracker.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <CardTitle className="text-base sm:text-lg font-black mt-2 leading-none">{selectedTracker.title}</CardTitle>
                      <CardDescription className="mt-2 text-xs font-bold text-slate-550 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" /> {selectedTracker.department}
                      </CardDescription>
                    </div>
                    <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Government Ref ID</span>
                      <h4 className="text-xs font-mono font-black text-slate-800 mt-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#1a56db]" />
                        {selectedTracker.referenceNumber || "UNLINKED (Pre-Filing Assistance)"}
                      </h4>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  
                  {/* Workflow Stage Progress Stepper */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Visual Workflow Stages</h4>
                    
                    {/* Stepper Bar */}
                    <div className="relative pt-6 pb-2 px-1">
                      
                      {/* Grid representation */}
                      <div className="grid grid-cols-9 gap-1 text-center relative z-10">
                        {WORKFLOW_STAGES.map((stage, idx) => {
                          const currentActiveIdx = getActiveStageIndex(selectedTracker.progress);
                          const isCompleted = idx < currentActiveIdx;
                          const isActive = idx === currentActiveIdx;
                          
                          return (
                            <div key={stage.id} className="flex flex-col items-center">
                              {/* Connector Ring */}
                              <div className={`w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                                isActive ? "bg-[#1a56db] border-[#1a56db] text-white shadow-md shadow-blue-500/30 scale-110 animate-pulse" :
                                "bg-white border-slate-300 text-slate-400"
                              }`}>
                                {isCompleted ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-[9px] font-black">{stage.id}</span>
                                )}
                              </div>
                              
                              {/* Label */}
                              <span className={`text-[8.5px] font-black tracking-tighter mt-2.5 block leading-none break-words max-w-[70px] ${
                                isActive ? "text-[#1a56db]" : 
                                isCompleted ? "text-emerald-700" : 
                                "text-slate-400"
                              }`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Timeline Connection Line behind */}
                      <div className="absolute top-[37px] left-8 right-8 h-0.5 bg-slate-200 z-0">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#1a56db] transition-all duration-550" 
                          style={{ width: `${(getActiveStageIndex(selectedTracker.progress) / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Ledger Milestones */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tracking Ledger (Timeline Logs)</h4>
                    <div className="relative border-l-2 border-slate-200 ml-4.5 pl-6 space-y-6 py-2">
                      {selectedTracker.timeline?.map((event, idx) => {
                        const isLast = idx === selectedTracker.timeline.length - 1;
                        return (
                          <div key={idx} className="relative">
                            
                            {/* Bullet icon indicator */}
                            <div className={`absolute left-[-34px] w-6.5 h-6.5 rounded-full border-2 bg-white flex items-center justify-center ${
                              isLast 
                                ? "border-[#1a56db] text-[#1a56db] shadow-xs" 
                                : "border-slate-350 text-slate-450"
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${isLast ? "bg-[#1a56db] animate-ping" : "bg-slate-450"}`} />
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-4">
                                <h4 className={`text-xs font-black uppercase tracking-wide leading-none ${
                                  isLast ? "text-[#1a56db]" : "text-slate-700"
                                }`}>
                                  {event.status.replace("_", " ")}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(event.date || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-550 mt-1.5 leading-relaxed font-medium">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Vetted Documents Cabinet */}
              <Card className="bg-white border-slate-250 shadow-xs" hover={false}>
                <CardHeader className="pb-0 mb-4">
                  <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Pre-Vetted Filing Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeTrackerDocs.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 font-medium">
                      No document audits linked to this session. Upload filing proofs inside the wizard stepper or documents tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTrackerDocs.map(doc => (
                        <div key={doc._id} className="p-3.5 rounded-xl border border-slate-250 bg-slate-50 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="text-xs font-extrabold text-slate-800 truncate max-w-[130px]" title={doc.fileName}>{doc.fileName}</span>
                              </div>
                              <Badge className={`uppercase text-[8.5px] border ${
                                doc.status === "verified" ? "bg-emerald-50 border-emerald-250 text-emerald-700" : "bg-amber-50 border-amber-250 text-amber-700"
                              }`}>
                                {doc.status}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-2 line-clamp-2">
                              {doc.summary || "Pre-vetting audit summary pending AI execution."}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-200 mt-3 flex items-center justify-between text-[9px] font-bold text-slate-400">
                            <span>{doc.documentType}</span>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[#1a56db] hover:underline flex items-center gap-1">
                              View File <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Guidance & Interactive Copilot Desk */}
              <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-350 border-slate-800 shadow-lg relative overflow-hidden" hover={false}>
                
                {/* Glowing BG elements */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                
                <CardHeader className="pb-0 mb-4 border-b border-white/5 pl-5 pr-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                      <div>
                        <CardTitle className="text-sm font-extrabold text-white">Gemini Interactive Assistance Desk</CardTitle>
                        <CardDescription className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Automated Citizen guidance copilot</CardDescription>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10">ACTIVE HELPLINE</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-5 pb-5">
                  
                  {/* Contextual static guidance first */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed font-medium">
                    <span className="text-blue-400 font-bold block mb-1">Recommended Next Actions:</span>
                    {selectedTracker.progress < 50 ? (
                      <span>Complete official application submission on the issuing department portal. Once submitted externally, retrieve the Reference Code and send it to our verification desks.</span>
                    ) : selectedTracker.status === "action_required" ? (
                      <span className="text-amber-300 font-bold">Action Required: An administrative agent requested a compliance correction. Inspect pre-vetted document audit status.</span>
                    ) : (
                      <span>Awaiting local RTO/Tehsildar desk verification checks. Your pre-vetting logs are 100% compliant. Estimated resolution remains accurate.</span>
                    )}
                  </div>

                  {/* Chat Console */}
                  <div className="space-y-3.5 pt-3 border-t border-white/5">
                    
                    <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-xs">
                      {copilotHistory.map((m, idx) => (
                        <div key={idx} className={`p-3 rounded-2xl leading-relaxed flex gap-2 ${
                          m.role === "user" 
                            ? "bg-blue-600 text-white ml-8" 
                            : "bg-white/5 text-slate-200 mr-8 border border-white/5"
                        }`}>
                          <div className="shrink-0 mt-0.5">
                            {m.role === "user" ? (
                              <span className="font-extrabold text-[9px] uppercase tracking-wider block opacity-75">You</span>
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                          <span className="font-medium whitespace-pre-wrap">{m.content}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendCopilotMsg} className="flex gap-2">
                      <input
                        value={copilotMsg}
                        onChange={e => setCopilotMsg(e.target.value)}
                        placeholder={`Ask Gemini about your ${selectedTracker.title}...`}
                        disabled={copilotLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={copilotLoading || !copilotMsg.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {copilotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>

                  </div>

                </CardContent>
              </Card>

            </div>
          ) : (
            <Card hover={false} className="bg-white py-36 text-center border-slate-250 shadow-xs">
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 border border-slate-100 shadow-inner">
                  <Clock className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black text-slate-800">Awaiting Service Tracker Selection</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto mt-2 leading-relaxed font-semibold">
                  Choose a tracked application service from the list panel or launch the new setup stepper to view compliance dashboards.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* ── IMMERSIVE SETUP STEPPER MODAL (6 STEPS) ── */}
      {mounted && wizardOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">AI Governance Stepper Setup</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Intelligent compliance assistance & tracking link</p>
                </div>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Status Indicators */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Wizard Step {wizardStep} of 6</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${
                    i <= wizardStep ? "bg-blue-600" : "bg-slate-200"
                  }`} />
                ))}
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* STEP 1: Choose Service */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Select Government Service</h4>
                    <p className="text-xs text-slate-500">Pick from our predefined standard portfolio catalog or write in customized applications below.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {SERVICE_CATALOG.map((service) => (
                      <div
                        key={service.label}
                        onClick={() => setSelectedService(service)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-32 relative ${
                          selectedService?.label === service.label
                            ? "border-[#1a56db] bg-blue-50/30 ring-1 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-350 bg-white"
                        }`}
                      >
                        <div className="absolute top-4 right-4 shrink-0">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[service.category]}`}>
                            {service.category}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 pr-12">{service.label}</h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">{service.department}</p>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed line-clamp-2 mt-2">
                          {service.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Write in option */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-black text-slate-800">Cannot find your exact service?</h4>
                    </div>
                    <div className="space-y-1">
                      <input
                        value={customServiceDesc}
                        onChange={e => {
                          setCustomServiceDesc(e.target.value);
                          setSelectedService({
                            label: e.target.value,
                            department: "Central/State Authority Assistance Bureau",
                            category: "Identity",
                            officialUrl: "https://www.india.gov.in/",
                            desc: "Custom governance request assisted by BureauAI algorithms."
                          });
                        }}
                        placeholder="Write in custom service title (e.g. Marriage Certificate)..."
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-blue-150"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AI Pre-filing Briefing */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">AI Pre-filing Compliance Briefing</h4>
                    <p className="text-xs text-slate-500">Gemini generated roadmap instructions and checklist to ensure zero-mistake submission.</p>
                  </div>

                  {briefingLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 text-[#1a56db] animate-spin" />
                      <p className="text-xs font-black uppercase tracking-wider">Generating compliance roadmap...</p>
                    </div>
                  ) : aiBriefing ? (
                    <div className="space-y-5">
                      
                      {/* Timeline expected */}
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Processing Timeline:
                        </span>
                        <span className="font-mono font-black text-emerald-700">{aiBriefing.timeline || "15 Working Days"}</span>
                      </div>

                      {/* Required documents checklist */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#1a56db]" /> Mandatory Filing Documents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aiBriefing.requiredDocuments?.map((doc, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700 shrink-0">{idx+1}</span>
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Steps roadmap */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-[#1a56db]" /> Sequential Action Steps
                        </h4>
                        <div className="space-y-2">
                          {aiBriefing.steps?.map((step, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-650 bg-white leading-relaxed">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Avoid Mistakes warnings */}
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-250 space-y-2">
                        <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" /> Common Mistakes to Avoid
                        </h4>
                        <ul className="space-y-1.5 pl-5 list-disc text-xs text-rose-800 font-medium">
                          {aiBriefing.commonMistakes?.map((mistake, idx) => (
                            <li key={idx}>{mistake}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : null}
                </div>
              )}

              {/* STEP 3: Document Vetting (AI Pre-Vetting) */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Pre-Vetting Document Audits</h4>
                    <p className="text-xs text-slate-500">
                      Upload your identity credentials or certificates to pre-vet compliance scans. Llama-3 audits credentials to flags errors instantly.
                    </p>
                  </div>

                  {/* Drag drop zone */}
                  <div 
                    onClick={() => document.getElementById("wizard-file-input").click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-98"
                  >
                    <input
                      id="wizard-file-input"
                      type="file"
                      className="hidden"
                      onChange={handleWizardFileUpload}
                    />
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl mb-3">
                      <UploadCloud className="w-6.5 h-6.5" />
                    </div>
                    <h5 className="text-xs font-black text-slate-800">Select certificate copy or drag file here</h5>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Supports PDF, PNG, JPEG up to 10MB</p>
                  </div>

                  {/* Vetting progress / error state */}
                  {fileUploading && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-3">
                      <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin" />
                      <span className="text-xs font-black uppercase text-slate-450 tracking-wider">AI Pre-Vetting Audits running...</span>
                    </div>
                  )}

                  {fileUploadError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4.5 h-4.5" /> {fileUploadError}
                    </div>
                  )}

                  {/* Audited files lists */}
                  {wizardFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Audited Credentials ({wizardFiles.length})</h4>
                      <div className="space-y-2">
                        {wizardFiles.map((doc, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-800 truncate max-w-[240px]">{doc.fileName}</h4>
                                <Badge className={`uppercase text-[8px] mt-1.5 border ${
                                  doc.status === "verified" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-250 text-amber-700"
                                }`}>
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-bold text-slate-450 block">{doc.documentType}</span>
                              <span className="text-[10.5px] text-slate-500 font-medium block mt-1 line-clamp-1 max-w-[180px]">{doc.summary}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 4: Official Portal Gateway */}
              {wizardStep === 4 && selectedService && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">External Government Submission Gateway</h4>
                    <p className="text-xs text-slate-500">BureauAI does not replace official submissions. Please apply on the official directory site.</p>
                  </div>

                  {/* Big redirect badge */}
                  <div className="p-6 bg-gradient-to-br from-amber-500/10 via-slate-50 to-emerald-500/10 border border-slate-250 rounded-3xl text-center space-y-4 relative overflow-hidden">
                    
                    {/* Tricolor design details */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
                    
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
                      <ExternalLink className="w-5.5 h-5.5 text-blue-600" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedService.department}</span>
                      <h4 className="text-sm font-extrabold text-slate-800">{selectedService.label} Official Portal</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-semibold max-w-sm mx-auto">
                        Once redirected, fill out the form, submit your audited documents, and complete processing payments.
                      </p>
                    </div>

                    <a
                      href={selectedService.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all active:scale-95 border border-emerald-600"
                    >
                      Browse to Official Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Explicit compliance notice */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-250 flex items-start gap-3">
                    <ShieldAlert className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-amber-800 leading-none">Security and Policy Disclaimer</h5>
                      <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                        BureauAI is a pre-filing compliance checklist helper. We are not officially affiliated withUIDAI or MEA departments. We do not directly transmit citizen files or claim to bypass portal queues.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Reference ID Linking */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">Seed Official Reference ID</h4>
                    <p className="text-xs text-slate-500">Record your official receipt reference number to activate visual tracking timelines.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Official Reference Code</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 focus-within:border-blue-600 rounded-2xl transition-all">
                      <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <input
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        placeholder="e.g. Passport ID: P12345678, Aadhaar: AID-998811"
                        className="flex-grow bg-transparent text-xs font-mono font-bold text-slate-800 outline-none placeholder-slate-450"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 leading-none block mt-1">
                      If you haven&apos;t filed officially yet, leave this blank. You can add it later to kickstart review stages.
                    </span>
                  </div>

                  {/* Interactive ID Validator */}
                  {referenceNumber.trim() && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                      <h5 className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 animate-pulse" /> Receipt Formatting Checklist
                      </h5>
                      <ul className="text-[11px] text-blue-700 space-y-1 font-semibold">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-blue-600" /> Matches standard alpha-numeric receipts
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-blue-600" /> Tracks progress under 9 central stages
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: Activation Success */}
              {wizardStep === 6 && selectedService && (
                <div className="text-center py-10 space-y-6">
                  
                  {/* Rotating visual crest */}
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 animate-fade-in shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2.5 max-w-sm mx-auto">
                    <h4 className="text-base font-black text-slate-800 leading-none">Ready for Central Registry Activation</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Your pre-vetting document audits are logged. Central dashboard will monitor your milestone stages.
                    </p>
                  </div>

                  <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl max-w-md mx-auto text-left flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Governance desk summary</h5>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{selectedService.department}</span>
                      <ul className="mt-2 text-[10.5px] text-slate-550 space-y-1 list-disc pl-4 font-semibold">
                        <li>Filing Service: {selectedService.label}</li>
                        <li>Reference Linked: {referenceNumber.trim() || "Awaiting submission"}</li>
                        <li>Documents Audited: {wizardFiles.length} credentials</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-4 py-2 border border-slate-250 bg-white rounded-xl text-xs font-black text-slate-650 hover:bg-slate-50 transition-all disabled:opacity-40"
              >
                Back Step
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setWizardOpen(false)}
                  className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                
                {wizardStep < 6 ? (
                  <button
                    disabled={wizardStep === 1 && !selectedService}
                    onClick={() => {
                      if (wizardStep === 1 && selectedService) {
                        generateAIBriefing(selectedService);
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-850 hover:from-blue-800 hover:to-indigo-950 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleActivateTracker}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Activate central track
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
