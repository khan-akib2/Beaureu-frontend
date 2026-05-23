"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  FileUp, 
  FileText, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DocumentUploadPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState("");

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API}/api/documents`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  }

  // Load existing user documents on mount
  useEffect(() => {
    setTimeout(() => {
      fetchDocuments();
    }, 0);
  }, []);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelected(droppedFile);
    }
  };

  // Handle file select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError("");
    const isImage = selectedFile.type.startsWith("image/");
    const isPdf = selectedFile.type === "application/pdf";
    
    if (!isImage && !isPdf) {
      setError("Please select a PDF or an Image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size exceeds 10MB limit.");
      return;
    }

    setFile(selectedFile);
  };

  // Perform upload
  const handleUploadSubmit = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(10);
    setError("");

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 80) {
          clearInterval(timer);
          return 80;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/documents`, {
        credentials: "include", 
        method: "POST",
        body: formData
      });

      clearInterval(timer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "File upload failed.");
      } else {
        setFile(null);
        setDocuments((prev) => [data.document, ...prev]);
        setSelectedDoc(data.document);
      }
    } catch (err) {
      setError("Could not establish connection to the document engine.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docId) => {
    try {
      const res = await fetch(`${API}/api/documents/${docId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        const updatedList = documents.filter((d) => d._id !== docId);
        setDocuments(updatedList);
        if (selectedDoc?._id === docId) {
          setSelectedDoc(updatedList.length > 0 ? updatedList[0] : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Document Compliance Audits</h1>
        <p className="mt-1 text-slate-500 text-xs sm:text-sm">Upload citizen identity cards or notices to run automated compliance checks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload zone & document listing */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white" hover={false}>
            <CardHeader>
              <CardTitle className="text-sm">Upload Filing Scan</CardTitle>
              <CardDescription className="text-xs">Drag PDF or JPEG files (max 10MB) · Analyzed by <span className="font-bold text-[#1a56db]">Groq AI</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Drag & Drop Area */}
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    dragActive 
                    ? "border-[#1a56db] bg-blue-50" 
                    : "border-slate-300 hover:border-[#1a56db] bg-slate-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl mb-4 transition-transform">
                    <FileUp className="w-5.5 h-5.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Drag files here, or click to browse</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Supports Aadhaar, PAN, Passports, Forms</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{file.name}</h4>
                      <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Progress and trigger buttons */}
              {file && (
                <div className="space-y-3">
                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Groq analyzing document...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-700 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleUploadSubmit}
                    className="w-full justify-center bg-blue-700 hover:bg-blue-800 text-white font-bold"
                    isLoading={uploading}
                  >
                    Analyze with Groq
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

          {/* List of uploaded documents */}
          <Card className="bg-white" hover={false}>
            <CardHeader className="pb-0 mb-4">
              <CardTitle className="text-sm">Audit History ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">No documents processed yet.</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {documents.map((doc) => (
                    <div 
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDoc?._id === doc._id 
                          ? "border-[#1a56db] bg-blue-50" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className={`w-5 h-5 flex-shrink-0 ${selectedDoc?._id === doc._id ? "text-blue-700" : "text-slate-400"}`} />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{doc.fileName}</h4>
                          <span className="text-[10px] text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={doc.status === "verified" ? "success" : "warning"}>
                          {doc.status.toUpperCase()}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc._id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                          title="Delete document"
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

        {/* Right Side: File preview & AI audit result panels */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Image/PDF Mock Preview */}
              <Card className="bg-white flex flex-col" hover={false}>
                <CardHeader className="pb-0 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-sm truncate max-w-40">{selectedDoc.fileName}</CardTitle>
                      <CardDescription className="text-xs">Filing Proof Preview</CardDescription>
                    </div>
                    <a 
                      href={selectedDoc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-700 transition-colors"
                      title="Open file URL"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4 bg-slate-100 rounded-2xl overflow-hidden min-h-64 border border-slate-200">
                  <img
                    src={selectedDoc.fileUrl}
                    alt="Uploaded Filing Scan"
                    className="max-h-72 object-contain opacity-90 rounded-lg hover:opacity-100 transition-opacity"
                  />
                </CardContent>
              </Card>

              {/* AI Audit details */}
              <Card className="bg-white relative overflow-hidden" hover={false}>
                <CardHeader className="pb-0 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Compliance Report</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        Powered by <span className="font-bold text-[#1a56db]">Groq · llama-3.1-8b</span>
                      </CardDescription>
                    </div>
                    <Badge variant={selectedDoc.status === "verified" ? "success" : "warning"}>
                      {selectedDoc.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Document type + authority */}
                  {(selectedDoc.documentType || selectedDoc.issuingAuthority) && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDoc.documentType && (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Document Type</p>
                          <p className="text-xs font-bold text-blue-800 mt-0.5">{selectedDoc.documentType}</p>
                        </div>
                      )}
                      {selectedDoc.issuingAuthority && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Issuing Authority</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5 leading-tight">{selectedDoc.issuingAuthority}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Extracted Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      {selectedDoc.summary}
                    </p>
                  </div>

                  {/* Missing requirements checks */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-blue-700" /> Compliance Flags
                    </h4>
                    {selectedDoc.missingRequirements && selectedDoc.missingRequirements.length > 0 ? (
                      <ul className="mt-2 space-y-1.5">
                        {selectedDoc.missingRequirements.map((req, idx) => (
                          <li key={idx} className="text-xs text-amber-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-4 h-4" /> No missing validation details. Document looks compliant!
                      </p>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#0e7490]" /> Suggested Next Steps
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {selectedDoc.suggestions && selectedDoc.suggestions.map((sug, idx) => (
                        <li key={idx} className="text-xs text-slate-500 flex items-start gap-2 leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0e7490] flex-shrink-0" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Step-by-Step Resolution Guide for Incomplete Documents */}
                  {selectedDoc.status === "incomplete" && selectedDoc.missingRequirements && selectedDoc.missingRequirements.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl border border-amber-250 bg-amber-50/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                        <h4 className="text-xs font-black text-amber-900">AI Step-by-Step Resolution Guide</h4>
                      </div>
                      <div className="space-y-2.5">
                        {selectedDoc.missingRequirements.map((req, idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                            <p className="font-extrabold text-slate-800 text-[11px]">How to resolve: &quot;{req}&quot;</p>
                            <p className="text-slate-550 font-semibold leading-relaxed text-[10px]">
                              {getResolutionStepsForRequirement(req, selectedDoc.documentType)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          ) : (
            <Card hover={false} className="bg-white py-20 text-center">
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Select or upload a document</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">Choose an entry from your history or drag a new scan to view AI compliance reports.</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

const getResolutionStepsForRequirement = (req, documentType) => {
  const norm = req.toLowerCase();
  const docNorm = (documentType || "").toLowerCase();

  if (norm.includes("signature")) {
    return "The digital signature is not validated. To verify, open the downloaded PDF in Adobe Acrobat Reader, right-click the signature field, select 'Validate Signature', and add the certificate to your 'Trusted Certificates' list.";
  }
  if (norm.includes("approving authority") || norm.includes("designation")) {
    if (docNorm.includes("gst")) {
      return "The designation of the approving authority is unverified. Ensure you have downloaded the official 'Form GST REG-06' directly from the GST Portal, which contains the signature and officer designation in Annexure B.";
    }
    return "The approving authority name or designation is missing. Ensure you are uploading a signed copy of the certificate issued by the competent authority (e.g. Tahsildar or Gazetted Officer).";
  }
  if (norm.includes("jurisdictional") || norm.includes("office")) {
    if (docNorm.includes("gst")) {
      return "The jurisdictional range/center details are missing. Log into the GST portal, go to Services > User Services > View My Submission/Profile, or verify your GSTIN details on the public Search Taxpayer directory.";
    }
    return "The jurisdictional office details are missing. Locate the issuing range or district sub-division office on the certificate, or check your profile at the state's e-District portal.";
  }
  if (norm.includes("stamp") || norm.includes("seal")) {
    return "The official department seal/stamp is not clearly visible. Please upload a high-resolution, color scan of the document. If it is a digital copy, ensure it is downloaded directly from the official portal without compression.";
  }
  if (norm.includes("validity") || norm.includes("expire")) {
    return "The document validity period has expired or is unverified. Apply for a renewal certificate through the revenue office, or download the latest valid copy via DigiLocker.";
  }
  return "Please re-upload a clear, full-page scan of the document. Ensure all corners are visible, text is highly legible, and all stamps, signatures, and government seals are not cut off.";
};
