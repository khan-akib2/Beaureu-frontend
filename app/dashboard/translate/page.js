"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { Languages, Copy, Volume2, VolumeX, Check, ArrowRight, FileText, Sparkles } from "lucide-react";

export default function TranslatePage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(""); setSpeaking(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/translate`, { credentials: "include",  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, language }) });
      const data = await res.json();
      if (res.ok) { setResult(data.translation); }
      else { setError(data.error || "Simplification failed."); }
    } catch { setError("Unable to connect to the translation service."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.replace(/###\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!result) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(result.replace(/###\s+/g, "").replace(/\*/g, ""));
    utterance.lang = { English: "en-US", Hindi: "hi-IN", Marathi: "mr-IN", Urdu: "ur-PK" }[language] || "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const sampleLegalese = "Pursuant to Gazette Notification No. F-12/908/Revenue-2025, it is hereby notified that all claimants seeking under-noted subsidies under Maharashtra Agricultural Relief Plan must heretofore submit attested affidavits of non-holding of alternate arable property mutatis mutandis to local tahsildar officials.";

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between stat-stripe">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Languages className="w-5 h-5 text-[#1a56db]" /> Legalese Translator
          </h1>
          <p className="mt-1 text-slate-500 text-xs">Paste bureaucratic notifications to extract plain-language regional summaries.</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Gemini AI
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Input Card */}
        <Card className="bg-white" hover={false}>
          <CardHeader>
            <CardTitle className="text-sm">Circular / Legalese Text</CardTitle>
            <CardDescription>Paste government notifications or complex orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextArea
              id="legalese-input"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste complex circular or order text here..."
              rows={9}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setText(sampleLegalese)}
                className="text-xs text-[#1a56db] font-semibold flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Load Sample
              </button>

              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold focus:border-[#1a56db] focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="English">Simplified English</option>
                </select>

                <Button onClick={handleTranslate} isLoading={loading} disabled={!text.trim() || loading} size="sm" className="gap-1.5">
                  Translate <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>
            )}
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="bg-white" hover={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">AI Simplified Output</CardTitle>
                <CardDescription>Plain-language structured summary</CardDescription>
              </div>
              {result && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeak}
                    className={`p-2 rounded-lg border transition-colors ${speaking ? "bg-teal-50 border-teal-200 text-teal-600" : "bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200"}`}
                    title="Read aloud"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {result.split("###").filter(Boolean).map((block, idx) => {
                  const lines = block.split("\n");
                  const title = lines[0].trim();
                  const content = lines.slice(1).join("\n").trim();
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto text-slate-400 mb-3">
                  <Languages className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Awaiting Translation Request</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Submit legislative notices in the left pane to extract simplified summaries.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
