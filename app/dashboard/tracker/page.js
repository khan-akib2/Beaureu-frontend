"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Clock, Plus, AlertCircle, Calendar, X, Trash2,
  Search, Pencil, Sparkles, ChevronDown, CheckCircle2, Loader2, Info
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Application catalogue ─────────────────────────────────────────────────────
const APP_CATALOGUE = [
  { label: "Passport Renewal",      department: "Ministry of External Affairs",         category: "Travel" },
  { label: "New Passport",          department: "Ministry of External Affairs",         category: "Travel" },
  { label: "PAN Card",              department: "Income Tax Department",                category: "Finance" },
  { label: "Aadhaar Update",        department: "UIDAI (Unique Identification Authority of India)", category: "Identity" },
  { label: "Ration Card",           department: "Department of Food & Public Distribution", category: "Welfare" },
  { label: "Driving License",       department: "Regional Transport Office (RTO)",      category: "Transport" },
  { label: "Voter ID",              department: "Election Commission of India",         category: "Identity" },
  { label: "Income Certificate",    department: "State Revenue Department / Tehsildar", category: "Certificate" },
  { label: "Caste Certificate",     department: "State Revenue Department / Tehsildar", category: "Certificate" },
  { label: "Domicile Certificate",  department: "State Revenue Department / Tehsildar", category: "Certificate" },
  { label: "Birth Certificate",     department: "Municipal Corporation / Gram Panchayat", category: "Certificate" },
  { label: "Marriage Certificate",  department: "Municipal Corporation / Sub-Registrar Office", category: "Certificate" },
  { label: "GST Registration",      department: "GST Council / CBIC",                  category: "Finance" },
];

const CATEGORY_COLORS = {
  Travel:      "bg-sky-50 text-sky-600 border-sky-100",
  Finance:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  Identity:    "bg-violet-50 text-violet-600 border-violet-100",
  Welfare:     "bg-orange-50 text-orange-600 border-orange-100",
  Transport:   "bg-amber-50 text-amber-600 border-amber-100",
  Certificate: "bg-rose-50 text-rose-600 border-rose-100",
};

// ── Searchable Application Dropdown ──────────────────────────────────────────
function AppSearchDropdown({ value, onChange, onDepartmentChange }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = query.trim()
    ? APP_CATALOGUE.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
      )
    : APP_CATALOGUE;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = useCallback((item) => {
    setQuery(item.label);
    onChange(item.label);
    onDepartmentChange(item.department);
    setOpen(false);
  }, [onChange, onDepartmentChange]);

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlighted];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const isSelected = APP_CATALOGUE.some((a) => a.label === query);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        What are you applying for? <span className="text-red-500">*</span>
      </label>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-all ${
          open ? "border-[#1a56db] ring-2 ring-[#1a56db]/10" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); onDepartmentChange(""); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search e.g. Passport, PAN Card, Aadhaar..."
          className="flex-1 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          autoComplete="off"
          aria-haspopup="listbox"
          aria-expanded={open}
        />
        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {/* "I don't know" option */}
          <div
            onClick={() => { onChange("I don't know my department"); onDepartmentChange(""); setQuery("I don't know my department"); setOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 cursor-pointer hover:bg-amber-50 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">I don't know my department</p>
              <p className="text-[10px] text-slate-400">AI will suggest the right authority for you</p>
            </div>
          </div>

          <ul ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 text-center">No matches found</li>
            ) : (
              filtered.map((item, idx) => (
                <li
                  key={item.label}
                  role="option"
                  aria-selected={idx === highlighted}
                  onClick={() => select(item)}
                  onMouseEnter={() => setHighlighted(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                    idx === highlighted ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.department}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${CATEGORY_COLORS[item.category]}`}>
                    {item.category}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
        <Info className="w-3 h-3" /> Type to search or scroll through all options
      </p>
    </div>
  );
}

// ── Department Field ──────────────────────────────────────────────────────────
function DepartmentField({ value, onChange, isAutoFilled, onEditToggle, editMode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        Issuing Authority / Department <span className="text-red-500">*</span>
      </label>
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
        isAutoFilled && !editMode
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-slate-200 focus-within:border-[#1a56db] focus-within:ring-2 focus-within:ring-[#1a56db]/10"
      }`}>
        {isAutoFilled && !editMode && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isAutoFilled && !editMode}
          placeholder="e.g. Ministry of External Affairs"
          className={`flex-1 text-xs font-medium outline-none bg-transparent ${
            isAutoFilled && !editMode ? "text-emerald-700 cursor-default" : "text-slate-800 placeholder-slate-400"
          }`}
          required
        />
        {isAutoFilled && (
          <button
            type="button"
            onClick={onEditToggle}
            className="p-1 rounded-lg hover:bg-white/60 transition-colors shrink-0"
            title={editMode ? "Lock field" : "Edit department"}
          >
            <Pencil className={`w-3 h-3 ${editMode ? "text-[#1a56db]" : "text-emerald-500"}`} />
          </button>
        )}
      </div>
      {isAutoFilled && !editMode && (
        <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Auto-filled based on your selection
        </p>
      )}
      {(!isAutoFilled || editMode) && (
        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
          <Info className="w-3 h-3" /> Enter the government body handling your application
        </p>
      )}
    </div>
  );
}

// ── AI Department Suggester ───────────────────────────────────────────────────
function AISuggester({ appName, onSuggest }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const askAI = async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `For a government application titled "${appName}", what is the correct issuing authority or department in India? Reply with ONLY the department name, nothing else.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.response) {
        const dept = data.response.replace(/\*\*/g, "").replace(/\n/g, "").trim().substring(0, 120);
        setSuggestion(dept);
      }
    } catch {
      setSuggestion("Could not fetch suggestion. Please enter manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-800">AI Department Finder</p>
          <p className="text-[10px] text-amber-600 mt-0.5">
            {appName && appName !== "I don't know my department"
              ? `Tell me the right authority for "${appName}"`
              : "Describe your application and AI will find the right department"}
          </p>
          {suggestion && (
            <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">Suggested Department</p>
              <p className="text-xs font-bold text-slate-800">{suggestion}</p>
              <button
                type="button"
                onClick={() => onSuggest(suggestion)}
                className="mt-2 text-[10px] font-bold text-[#1a56db] hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Use this suggestion
              </button>
            </div>
          )}
          {!suggestion && (
            <button
              type="button"
              onClick={askAI}
              disabled={loading}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {loading ? "Finding..." : "Ask AI"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const [trackers, setTrackers] = useState([]);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [newTrackerOpen, setNewTrackerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [deptEditMode, setDeptEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchTrackers(); }, []);

  async function fetchTrackers() {
    try {
      const res = await fetch(`${API}/api/applications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTrackers(data.applications || []);
        if (data.applications?.length > 0) setSelectedTracker(data.applications[0]);
      }
    } catch (err) {
      console.error("Failed to load trackers:", err);
    }
  }

  const resetForm = () => {
    setTitle(""); setDepartment(""); setIsAutoFilled(false);
    setDeptEditMode(false); setError("");
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    // If user clears or types freely, reset auto-fill state
    if (!APP_CATALOGUE.some((a) => a.label === val)) {
      setIsAutoFilled(false);
      setDeptEditMode(false);
    }
  };

  const handleDepartmentAutoFill = (dept) => {
    if (dept) { setDepartment(dept); setIsAutoFilled(true); setDeptEditMode(false); }
    else { setIsAutoFilled(false); }
  };

  const handleCreateTracker = async (e) => {
    e.preventDefault();
    const finalTitle = title === "I don't know my department" ? "" : title;
    if (!finalTitle.trim() || !department.trim()) {
      setError("Please select an application type and confirm the department.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finalTitle, department }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrackers((prev) => [data.application, ...prev]);
        setSelectedTracker(data.application);
        resetForm();
        setNewTrackerOpen(false);
      } else {
        setError(data.error || "Failed to initialize tracker.");
      }
    } catch {
      setError("Unable to connect to registration server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTracker = async (appId) => {
    try {
      const res = await fetch(`${API}/api/applications/${appId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        const updated = trackers.filter((t) => t._id !== appId);
        setTrackers(updated);
        if (selectedTracker?._id === appId) setSelectedTracker(updated[0] || null);
      }
    } catch (err) {
      console.error("Failed to delete tracker:", err);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const map = { approved: "success", under_review: "info", action_required: "danger", rejected: "danger" };
    return map[status] || "neutral";
  };

  const showAISuggester = title === "I don't know my department" || (title && !isAutoFilled);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Application Milestone Trackers <Clock className="w-5 h-5 text-[#1a56db]" />
          </h1>
          <p className="mt-1 text-xs text-slate-500">Track and monitor processing progress of registrations at municipal or state bodies.</p>
        </div>
        <Button onClick={() => { resetForm(); setNewTrackerOpen(true); }} className="gap-1.5 bg-[#1a56db] hover:bg-blue-800 text-white font-bold">
          <Plus className="w-4 h-4" /> Start New Tracker
        </Button>
      </div>

      {/* ── New Tracker Modal ── */}
      {newTrackerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1a56db] flex items-center justify-center shadow-sm shadow-blue-500/30">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Start New Tracker</h3>
                  <p className="text-[10px] text-slate-400">Track your government application progress</p>
                </div>
              </div>
              <button
                onClick={() => { setNewTrackerOpen(false); resetForm(); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Helper banner */}
            <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-[#1a56db] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">First time?</span> Just search for what you're applying for — we'll automatically fill in the right government department for you.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTracker} className="p-5 space-y-4">

              {/* Application search dropdown */}
              <AppSearchDropdown
                value={title}
                onChange={handleTitleChange}
                onDepartmentChange={handleDepartmentAutoFill}
              />

              {/* Department field */}
              <DepartmentField
                value={department}
                onChange={(v) => { setDepartment(v); setIsAutoFilled(false); }}
                isAutoFilled={isAutoFilled}
                editMode={deptEditMode}
                onEditToggle={() => setDeptEditMode((m) => !m)}
              />

              {/* AI Suggester — shown when dept is unknown or user typed freely */}
              {showAISuggester && (
                <AISuggester
                  appName={title}
                  onSuggest={(dept) => { setDepartment(dept); setIsAutoFilled(true); setDeptEditMode(false); }}
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setNewTrackerOpen(false); resetForm(); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !department.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {loading ? "Registering..." : "Register Tracker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tracker List + Detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: list */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white" hover={false}>
            <CardHeader className="pb-0 mb-4">
              <CardTitle className="text-sm">Active Trackers ({trackers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {trackers.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">No active trackers found.</p>
                  <button
                    onClick={() => { resetForm(); setNewTrackerOpen(true); }}
                    className="mt-2 text-xs font-bold text-[#1a56db] hover:underline"
                  >
                    Start your first tracker →
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {trackers.map((app) => (
                    <div
                      key={app._id}
                      onClick={() => setSelectedTracker(app)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedTracker?._id === app._id
                          ? "border-[#1a56db] bg-blue-50/30"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{app.title}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{app.department}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace("_", " ")}
                        </Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTracker(app._id); }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete tracker"
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

        {/* Right: detail */}
        <div className="lg:col-span-2">
          {selectedTracker ? (
            <Card className="bg-white relative overflow-hidden" hover={false}>
              <CardHeader className="border-b border-slate-100 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge variant={getStatusBadgeVariant(selectedTracker.status)} className="mb-2">
                      {selectedTracker.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <CardTitle className="text-base sm:text-lg">{selectedTracker.title}</CardTitle>
                    <CardDescription className="mt-1 font-semibold">{selectedTracker.department}</CardDescription>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reference Code</span>
                    <h4 className="text-sm font-bold text-slate-800">{selectedTracker.referenceNumber}</h4>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Application Resolution</span>
                    <span className="text-[#1a56db] font-bold">{selectedTracker.progress}% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a56db] rounded-full transition-all duration-500" style={{ width: `${selectedTracker.progress}%` }} />
                  </div>
                </div>

                {/* Estimated date */}
                {selectedTracker.estimatedCompletion && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Calendar className="w-4 h-4 text-[#1a56db]" />
                      <span>Estimated Processing Completion Date:</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedTracker.estimatedCompletion).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Action required alert */}
                {selectedTracker.status === "action_required" && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Clarification Required</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                        {selectedTracker.timeline[selectedTracker.timeline.length - 1]?.description}
                      </p>
                      <button onClick={() => window.location.href = "/dashboard/upload"} className="mt-2 text-xs text-[#1a56db] hover:underline font-bold">
                        Upload Documents Now →
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tracking Milestones</h4>
                  <div className="relative border-l border-slate-200 ml-3.5 pl-6 space-y-6 py-2">
                    {selectedTracker.timeline.map((event, idx) => {
                      const isLast = idx === selectedTracker.timeline.length - 1;
                      return (
                        <div key={idx} className="relative">
                          <div className={`absolute left-[-31px] p-1 rounded-full border ring-4 ring-slate-50 flex items-center justify-center ${
                            isLast ? "bg-[#1a56db] border-[#1a56db] text-white" : "bg-slate-200 border-slate-300 text-slate-500"
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <h4 className={`text-xs font-bold capitalize ${isLast ? "text-[#1a56db]" : "text-slate-700"}`}>
                                {event.status.replace("_", " ")}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card hover={false} className="bg-white py-24 text-center">
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto text-slate-400 mb-3">
                  <Clock className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Awaiting Selection</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Choose an application tracker from the list or register a new reference to view milestone tracking logs.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
