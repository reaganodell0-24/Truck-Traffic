"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { useRoutes } from "@/hooks/use-routes";

export default function DebugPage() {
  const [fetchResult, setFetchResult] = useState<string>("Loading...");
  const store = useAppStore();
  const { data: swrRoutes, error: swrError, isLoading } = useRoutes();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/routes`)
      .then((r) => r.json())
      .then((data) => setFetchResult(`OK: ${data.length} routes. First: ${data[0]?.name}`))
      .catch((err) => setFetchResult(`ERROR: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", background: "#0a0e17", color: "#f1f5f9", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Debug Page v2</h1>

      <Section title="1. Direct fetch()">
        <pre>{fetchResult}</pre>
      </Section>

      <Section title="2. SWR useRoutes() hook">
        <pre>isLoading: {String(isLoading)}</pre>
        <pre>error: {swrError ? String(swrError) : "none"}</pre>
        <pre>data: {swrRoutes ? `${swrRoutes.length} routes` : "null"}</pre>
        {swrRoutes && <pre>First route: {JSON.stringify(swrRoutes[0]?.name)}</pre>}
      </Section>

      <Section title="3. Zustand store state">
        <pre>selectedRouteId: {String(store.selectedRouteId)}</pre>
        <pre>activePanel: {String(store.activePanel)}</pre>
        <pre>companyFilter: {String(store.companyFilter)}</pre>
      </Section>

      <Section title="4. Test: Click a route">
        {swrRoutes?.slice(0, 3).map((r) => (
          <button
            key={r.id}
            onClick={() => {
              console.log("Selecting route:", r.id);
              store.selectRoute(r.id);
            }}
            style={{ display: "block", background: "#1a2234", border: "1px solid #1e293b", color: "#f1f5f9", padding: "8px 16px", margin: "4px 0", borderRadius: 6, cursor: "pointer", width: "100%" }}
          >
            {r.id}: {r.name}
          </button>
        ))}
        <pre style={{ marginTop: 8 }}>After click - selectedRouteId: {String(store.selectedRouteId)}</pre>
        <pre>After click - activePanel: {String(store.activePanel)}</pre>
      </Section>

      <Section title="5. Test: Open panel">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["faf5", "transborder", "av-penetration", "ev-feasibility", "corridor-dive", "industry"] as const).map((p) => (
            <button
              key={p}
              onClick={() => store.openPanel(p)}
              style={{ background: store.activePanel === p ? "#00d4aa" : "#1a2234", color: store.activePanel === p ? "#0a0e17" : "#f1f5f9", border: "1px solid #1e293b", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
            >
              {p}
            </button>
          ))}
          <button onClick={() => store.closePanel()} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Close</button>
        </div>
        <pre style={{ marginTop: 8 }}>activePanel: {String(store.activePanel)}</pre>
      </Section>

      {/* Test panel rendering */}
      {store.activePanel && store.activePanel !== "route-detail" && (
        <div style={{
          position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
          background: "#1a2234", borderLeft: "1px solid #1e293b", zIndex: 50, padding: 20,
          transition: "transform 0.3s ease"
        }}>
          <h3 style={{ color: "#00d4aa" }}>Panel: {store.activePanel}</h3>
          <p>Zustand state is working! The panel opened via store.openPanel()</p>
          <button onClick={() => store.closePanel()} style={{ marginTop: 10, cursor: "pointer", background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: 6 }}>Close</button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a2234", padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{title}</h2>
      {children}
    </div>
  );
}
