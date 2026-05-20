"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { 
  Clock, 
  Plus, 
  AlertCircle, 
  Calendar,
  X,
  Trash2
} from "lucide-react";

export default function TrackerPage() {
  const [trackers, setTrackers] = useState([]);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [newTrackerOpen, setNewTrackerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrackers();
  }, []);

  async function fetchTrackers() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTrackers(data.applications || []);
        if (data.applications && data.applications.length > 0) {
          setSelectedTracker(data.applications[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load trackers:", err);
    }
  }

  const handleCreateTracker = async (e) => {
    e.preventDefault();
    if (!title || !department) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, { credentials: "include", 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, department })
      });

      const data = await res.json();
      if (res.ok) {
        setTrackers((prev) => [data.application, ...prev]);
        setSelectedTracker(data.application);
        setTitle("");
        setDepartment("");
        setNewTrackerOpen(false);
      } else {
        setError(data.error || "Failed to initialize tracker.");
      }
    } catch (err) {
      setError("Unable to connect to registration server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTracker = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        const updatedList = trackers.filter((t) => t._id !== appId);
        setTrackers(updatedList);
        if (selectedTracker?._id === appId) {
          setSelectedTracker(updatedList.length > 0 ? updatedList[0] : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete application tracker:", err);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "approved": return "success";
      case "under_review": return "info";
      case "action_required": return "danger";
      case "rejected": return "danger";
      default: return "neutral";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Application Milestone Trackers <Clock className="w-5.5 h-5.5 text-[#1a56db]" />
          </h1>
          <p className="mt-1 text-xs text-slate-500">Track and monitor processing progress of registrations at municipal or state bodies.</p>
        </div>
        <Button 
          onClick={() => setNewTrackerOpen(true)}
          className="gap-1.5 bg-[#1a56db] hover:bg-blue-800 text-white font-bold"
        >
          <Plus className="w-4.5 h-4.5" /> Start New Tracker
        </Button>
      </div>

      {/* New Tracker dialog modal */}
      {newTrackerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <Card className="w-full max-w-md bg-white shadow-2xl" hover={false}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Initialize Tracker</CardTitle>
                <CardDescription className="text-xs">Add new application reference details</CardDescription>
              </div>
              <button 
                onClick={() => setNewTrackerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTracker} className="space-y-4">
                
                <Input
                  label="Application Name"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Passport Renewal, Ration Card"
                  required
                />

                <Input
                  label="Issuing Authority / Department"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Ministry of External Affairs"
                  required
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setNewTrackerOpen(false)} className="bg-white">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={loading} className="bg-[#1a56db] hover:bg-blue-800 text-white font-bold">
                    Register Tracker
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column list */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white" hover={false}>
            <CardHeader className="pb-0 mb-4">
              <CardTitle className="text-sm">Active Trackers ({trackers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {trackers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">No active trackers found.</p>
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
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{app.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{app.department}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace("_", " ")}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTracker(app._id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
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

        {/* Right column details */}
        <div className="lg:col-span-2">
          {selectedTracker ? (
            <Card className="bg-white relative overflow-hidden" hover={false}>
              
              <CardHeader className="pb-0 border-b border-slate-100 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge variant={getStatusBadgeVariant(selectedTracker.status)} className="mb-2">
                      {selectedTracker.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <CardTitle className="text-base sm:text-lg">{selectedTracker.title}</CardTitle>
                    <CardDescription className="mt-1 font-semibold">{selectedTracker.department}</CardDescription>
                  </div>
                  
                  <div className="text-left sm:text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reference Code</span>
                    <h4 className="text-sm font-bold text-slate-800">{selectedTracker.referenceNumber}</h4>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Application Resolution</span>
                    <span className="text-[#1a56db] font-bold">{selectedTracker.progress}% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1a56db] rounded-full transition-all duration-300"
                      style={{ width: `${selectedTracker.progress}%` }}
                    />
                  </div>
                </div>

                {/* Estimate Date box */}
                {selectedTracker.estimatedCompletion && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Calendar className="w-4 h-4 text-[#1a56db]" />
                      <span>Estimated Processing Completion Date:</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedTracker.estimatedCompletion).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {/* Flag Alert Callout if action is required */}
                {selectedTracker.status === "action_required" && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Clarification Required</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                        {selectedTracker.timeline[selectedTracker.timeline.length - 1]?.description}
                      </p>
                      <button 
                        onClick={() => window.location.href = "/dashboard/upload"}
                        className="mt-2 text-xs text-[#1a56db] hover:underline font-bold"
                      >
                        Upload Documents Now &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline display */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tracking Milestones</h4>
                  
                  <div className="relative border-l border-slate-200 ml-3.5 pl-6 space-y-6 py-2">
                    {selectedTracker.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        
                        {/* Timeline Node Icon/Dot */}
                        <div className={`absolute -left-[31px] p-1 rounded-full border ring-4 ring-slate-50 flex items-center justify-center ${
                          idx === selectedTracker.timeline.length - 1
                            ? "bg-[#1a56db] border-[#1a56db] text-white"
                            : "bg-slate-200 border-slate-300 text-slate-500"
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <h4 className={`text-xs font-bold capitalize ${
                              idx === selectedTracker.timeline.length - 1
                                ? "text-[#1a56db]"
                                : "text-slate-700"
                            }`}>
                              {event.status.replace("_", " ")}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(event.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                        </div>

                      </div>
                    ))}
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
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">Choose an application tracker from the list or register a new reference to view milestone tracking logs.</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
