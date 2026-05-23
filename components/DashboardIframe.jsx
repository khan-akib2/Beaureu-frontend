"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DashboardIframe({ children }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write("<!doctype html><html><head></head><body><div id=\"dashboard-frame-root\"></div></body></html>");
    doc.close();

    const head = doc.head;
    document.querySelectorAll("link[rel=\"stylesheet\"], style").forEach((node) => {
      head.appendChild(node.cloneNode(true));
    });

    const base = doc.createElement("base");
    base.target = "_parent";
    head.prepend(base);

    const frameStyle = doc.createElement("style");
    frameStyle.textContent = `
      html {
        min-height: 100%;
        margin: 0;
        background: #f8fafc;
      }
      body {
        min-height: 100%;
        margin: 0;
        overflow-x: hidden;
        background: #f8fafc;
        box-sizing: border-box;
        padding: 18px;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      #dashboard-frame-root {
        min-height: calc(100vh - 36px);
        background: #f8fafc;
      }
      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      ::-webkit-scrollbar-track {
        background: #f8fafc;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 9999px;
      }
    `;
    head.appendChild(frameStyle);

    setMountNode(doc.getElementById("dashboard-frame-root"));
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="BureauAI dashboard section"
      className="block h-full min-h-0 w-full rounded-[24px] border border-[#F8FAFC] bg-[#F8FAFC] shadow-none"
    >
      {mountNode ? createPortal(children, mountNode) : null}
    </iframe>
  );
}
