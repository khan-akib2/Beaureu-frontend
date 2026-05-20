"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchHistory();
  }, []);

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
        <div className="lg:col-span-1 space-y-6">
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
                        <a
                          href={scheme.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#1a56db] bg-slate-50 text-xs text-slate-600 font-bold transition-all flex-shrink-0"
                        >
                          Apply Portal <ExternalLink className="w-3.5 h-3.5" />
                        </a>
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
    </div>
  );
}
