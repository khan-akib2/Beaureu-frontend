"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { 
  ClipboardCheck, 
  ExternalLink, 
  IndianRupee, 
  History
} from "lucide-react";

export default function EligibilityPage() {
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [occupation, setOccupation] = useState("Farmer");
  const [location, setLocation] = useState("Maharashtra");
  const [category, setCategory] = useState("General");
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const [activeGuide, setActiveGuide] = useState(null);
  const [mounted, setMounted] = useState(false);

  async function fetchHistory() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/eligibility`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load checks history:", err);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(t);
  }, []);



  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!age || !income) {
      setError("Please fill in age and annual family income.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/eligibility`, { credentials: "include", 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          age: Number(age),
          income: Number(income),
          occupation,
          location,
          category
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        fetchHistory(); // Refresh history
      } else {
        setError(data.error || "Eligibility evaluation failed.");
      }
    } catch (err) {
      setError("Unable to connect to scheme directory server.");
    } finally {
      setLoading(false);
    }
  };

  const loadPastCheck = (checkResults) => {
    setResults(checkResults);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          Scheme Eligibility Evaluator <ClipboardCheck className="w-5.5 h-5.5 text-[#1a56db]" />
        </h1>
        <p className="mt-1 text-slate-500 text-xs sm:text-sm">Scan Central and State welfare programs matching your demographic parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Parameters input Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-5 self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto space-y-6 pr-1">
          <Card className="bg-white" hover={false}>
            <CardHeader>
              <CardTitle className="text-sm">Demographics Profile</CardTitle>
              <CardDescription className="text-xs">Specify search profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEvaluate} className="space-y-4">
                
                <Input
                  label="Applicant Age"
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="120"
                  required
                />

                <Input
                  label="Family Annual Income (₹)"
                  id="income"
                  type="number"
                  placeholder="e.g. 150000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  min="0"
                  required
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="occupation" className="text-xs font-semibold text-slate-500">Occupation</label>
                  <select
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none transition-all text-xs"
                  >
                    <option value="Farmer">Farmer / Agriculture</option>
                    <option value="Labourer">Unorganized Worker / Labourer</option>
                    <option value="Driver">Driver / Logistics</option>
                    <option value="Student">Student</option>
                    <option value="Self Employed">Self Employed / Shopkeeper</option>
                    <option value="Professional">Salaried Professional</option>
                    <option value="Others">Others / Unemployed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="location" className="text-xs font-semibold text-slate-500">State / Region</label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none transition-all text-xs"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Others">Other State</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="category" className="text-xs font-semibold text-slate-500">Social Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none transition-all text-xs"
                  >
                    <option value="General">General / UR</option>
                    <option value="OBC">OBC (Other Backward Classes)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-800 text-white font-bold"
                  isLoading={loading}
                >
                  <ClipboardCheck className="w-5 h-5" /> Find Matching Schemes
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* Past Checks History */}
          <Card className="bg-white" hover={false}>
            <CardHeader className="pb-0 mb-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" /> Query History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">No past evaluations.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {history.map((check) => (
                    <div
                      key={check._id}
                      onClick={() => loadPastCheck(check.results)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#1a56db]/35 cursor-pointer flex justify-between items-center text-left"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-800 block">
                          Age {check.inputs.age} • Inc. ₹{check.inputs.income.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {check.inputs.occupation} • {check.inputs.location}
                        </span>
                      </div>
                      <Badge variant="info" className="text-[9px] px-1.5 py-0 font-bold bg-blue-50 text-[#1a56db]">
                        {check.results.length} Matches
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Eligible welfare schemes output */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-40 skeleton-shimmer rounded-3xl" />
              <div className="h-40 skeleton-shimmer rounded-3xl" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Eligible Welfare Programs ({results.length})
                </h3>
                <span className="text-[10px] bg-blue-50 border border-blue-100 text-[#1a56db] px-2.5 py-1 rounded-full font-bold">
                  Matched via Gemini directory
                </span>
              </div>

              <div className="space-y-6">
                {results.map((scheme, idx) => (
                  <Card key={idx} className="bg-white relative overflow-hidden" hover={false}>
                    <CardHeader className="pb-0 mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="success" className="mb-2 text-[9px] px-2 py-0.5 font-bold">
                            {scheme.matchScore}% Eligibility Score
                          </Badge>
                          <CardTitle className="text-sm sm:text-base">{scheme.schemeName}</CardTitle>
                          <CardDescription className="mt-1 font-semibold">{scheme.department}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveGuide(scheme)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a56db] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/10"
                          >
                            Guide Me ✨
                          </button>
                          <a
                            href={scheme.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#1a56db] bg-slate-50 text-xs text-slate-600 font-bold transition-all"
                          >
                            Apply Portal <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {scheme.description}
                      </p>

                      {/* Benefit box */}
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                        <IndianRupee className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Direct Transfer / Benefits</span>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">{scheme.benefits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card hover={false} className="bg-white py-24 text-center">
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto text-slate-400 mb-3">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Awaiting Profile Parameters</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">Fill out the search form on the left to scan live welfares.</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {mounted && activeGuide && createPortal(
        <GuidePortal 
          scheme={activeGuide} 
          onClose={() => setActiveGuide(null)} 
        />,
        document.body
      )}
    </div>
  );
}

function GuidePortal({ scheme, onClose }) {
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  async function fetchGuide() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeName: scheme.schemeName,
          department: scheme.department,
          description: scheme.description,
          userProfile: {}
        }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setGuideData(data.guide);
        setMessages([
          {
            role: "model",
            content: `Hello! I am your BureauAI guide for the **${scheme.schemeName}**. I can help walk you through the application process step-by-step. Ask me anything about the required documents, eligibility, or portal navigation!`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchGuide();
    }, 0);
  }, [scheme]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/guide/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeName: scheme.schemeName,
          department: scheme.department,
          messages: [...messages, userMsg]
        }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "model", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "model", content: "Connection lost. Please check your internet." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 animate-fade-in font-sans">
      <div 
        className="w-full max-w-2xl h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#1a56db] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              Application Guide & Roadmap
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{scheme.schemeName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content body - scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="space-y-4 py-12 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Generating step-by-step roadmap from BureauAI...</p>
            </div>
          ) : (
            <>
              {/* Timeline Info */}
              {guideData?.timeline && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Processing Timeline</span>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">{guideData.timeline}</p>
                  </div>
                </div>
              )}

              {/* Steps Checklist */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-3">Application Roadmap</h3>
                <div className="space-y-3">
                  {guideData?.steps?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <span className="w-5 h-5 rounded-full bg-[#1a56db] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal Navigation Guidance */}
              {guideData?.navigationGuidance && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Website Navigation Help</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{guideData.navigationGuidance}</p>
                </div>
              )}

              {/* Two columns - Documents and Mistakes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required Documents */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Required Documents</h4>
                  <ul className="space-y-1.5">
                    {guideData?.requiredDocuments?.map((doc, idx) => (
                      <li key={idx} className="text-xs text-slate-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes */}
                <div className="p-4 rounded-2xl bg-red-50/30 border border-red-100/50 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Common Mistakes to Avoid</h4>
                  <ul className="space-y-1.5">
                    {guideData?.commonMistakes?.map((mistake, idx) => (
                      <li key={idx} className="text-xs text-slate-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Help Assistant */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1a56db]/10 rounded-lg text-[#1a56db]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ask BureauAI Guide</h4>
                    <p className="text-[9px] text-slate-400 font-semibold">Have doubts? Ask questions in your preferred language!</p>
                  </div>
                </div>

                {/* Chat Message Pane */}
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-3">
                  {messages.map((m, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed ${
                          m.role === "user" 
                            ? "bg-[#1a56db] text-white rounded-tr-none" 
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about website links, required documents, or processes..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !input.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#1a56db] text-white hover:bg-blue-800 disabled:opacity-50 text-xs font-bold transition-all shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
