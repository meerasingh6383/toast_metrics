import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const raw = [
  { q: "Q3'21", locEnd: 53,  locBeg: 48,  subRev: 46,  ftRev: 404,  totalRev: 486,  subCost: 18, ftCost: 327, gpv: 16.5 },
  { q: "Q4'21", locEnd: 57,  locBeg: 53,  subRev: 54,  ftRev: 421,  totalRev: 512,  subCost: 22, ftCost: 341, gpv: 17.0 },
  { q: "Q1'22", locEnd: 62,  locBeg: 57,  subRev: 63,  ftRev: 438,  totalRev: 535,  subCost: 25, ftCost: 347, gpv: 17.8 },
  { q: "Q2'22", locEnd: 68,  locBeg: 62,  subRev: 76,  ftRev: 562,  totalRev: 675,  subCost: 27, ftCost: 448, gpv: 23.3 },
  { q: "Q3'22", locEnd: 74,  locBeg: 68,  subRev: 90,  ftRev: 628,  totalRev: 752,  subCost: 29, ftCost: 494, gpv: 25.2 },
  { q: "Q4'22", locEnd: 79,  locBeg: 74,  subRev: 95,  ftRev: 640,  totalRev: 769,  subCost: 32, ftCost: 503, gpv: 25.5 },
  { q: "Q1'23", locEnd: 85,  locBeg: 79,  subRev: 107, ftRev: 673,  totalRev: 819,  subCost: 36, ftCost: 523, gpv: 26.7 },
  { q: "Q2'23", locEnd: 93,  locBeg: 85,  subRev: 121, ftRev: 808,  totalRev: 978,  subCost: 39, ftCost: 631, gpv: 32.1 },
  { q: "Q3'23", locEnd: 99,  locBeg: 93,  subRev: 131, ftRev: 856,  totalRev: 1032, subCost: 43, ftCost: 674, gpv: 33.7 },
  { q: "Q4'23", locEnd: 106, locBeg: 99,  subRev: 142, ftRev: 851,  totalRev: 1036, subCost: 48, ftCost: 675, gpv: 33.7 },
  { q: "Q1'24", locEnd: 112, locBeg: 106, subRev: 151, ftRev: 873,  totalRev: 1075, subCost: 50, ftCost: 683, gpv: 34.7 },
  { q: "Q2'24", locEnd: 120, locBeg: 112, subRev: 166, ftRev: 1023, totalRev: 1242, subCost: 53, ftCost: 806, gpv: 40.5 },
  { q: "Q3'24", locEnd: 127, locBeg: 120, subRev: 189, ftRev: 1067, totalRev: 1305, subCost: 56, ftCost: 835, gpv: 41.7 },
  { q: "Q4'24", locEnd: 134, locBeg: 127, subRev: 200, ftRev: 1090, totalRev: 1338, subCost: 60, ftCost: 852, gpv: 42.2 },
  { q: "Q1'25", locEnd: 140, locBeg: 134, subRev: 209, ftRev: 1082, totalRev: 1337, subCost: 66, ftCost: 831, gpv: 42.2 },
  { q: "Q2'25", locEnd: 148, locBeg: 140, subRev: 227, ftRev: 1276, totalRev: 1550, subCost: 64, ftCost: 992, gpv: 49.9 },
  { q: "Q3'25", locEnd: 156, locBeg: 148, subRev: 244, ftRev: 1345, totalRev: 1633, subCost: 67, ftCost: 1032, gpv: 51.5 },
  { q: "Q4'25", locEnd: 164, locBeg: 156, subRev: 256, ftRev: 1334, totalRev: 1633, subCost: 67, ftCost: 1036, gpv: 51.4 },
];

const computed = raw.map(d => {
  const avgLoc = (d.locBeg + d.locEnd) / 2;
  const ftGP = d.ftRev - d.ftCost;
  return {
    q: d.q,
    avgLoc,
    totalRev: d.totalRev,
    gpv: d.gpv,
    subRev: d.subRev,
    ftRev: d.ftRev,
    ftGP,
    locEnd: d.locEnd,
    gpvPerLoc: Math.round((d.gpv * 1e3 / avgLoc / 3) * 10) / 10,
    subRevPerLoc: Math.round(d.subRev * 1e3 / avgLoc / 3),
    ftGPPerLoc: Math.round(ftGP * 1e3 / avgLoc / 3),
    netRevPerLoc: Math.round((d.subRev + ftGP) * 1e3 / avgLoc / 3),
    totalRevPerLoc: Math.round(d.totalRev * 1e3 / avgLoc / 3),
    takeRate: Math.round((d.ftRev / (d.gpv * 1e3)) * 1e5) / 1e3,
    ftMargin: Math.round((ftGP / d.ftRev) * 1e3) / 10,
    subMargin: Math.round(((d.subRev - d.subCost) / d.subRev) * 1e3) / 10,
  };
});

// YoY pairs: index -> index 4 quarters prior
const yoyPairs = {};
for (let i = 4; i < raw.length; i++) {
  yoyPairs[i] = i - 4;
}

const yoyGrowth = (key, currIdx) => {
  const priorIdx = yoyPairs[currIdx];
  if (priorIdx === undefined) return null;
  const curr = computed[currIdx][key];
  const prior = computed[priorIdx][key];
  if (!prior) return null;
  return Math.round(((curr - prior) / prior) * 1000) / 10;
};

const allKeys = ["gpvPerLoc", "subRevPerLoc", "ftGPPerLoc", "netRevPerLoc", "totalRevPerLoc", "totalRev", "gpv", "locEnd", "ftGP", "takeRate", "ftMargin", "subMargin", "subRev", "ftRev"];
const data = computed.map((d, i) => {
  const row = { ...d };
  allKeys.forEach(k => {
    row[`${k}_yoy`] = yoyGrowth(k, i);
  });
  return row;
});

const CARD_BG = "#ffffff";
const BORDER = "#e5e7eb";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const BLUE = "#2563eb";
const GREEN = "#059669";
const ORANGE = "#ea580c";
const PURPLE = "#7c3aed";
const RED = "#dc2626";
const TEAL = "#0d9488";

const Chart = ({ title, dataKey, color, domain, tickFmt, tooltipFmt }) => {
  const yoyKey = `${dataKey}_yoy`;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 16px 8px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12, fontFamily: "monospace" }}>{title}</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 22, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
          <XAxis dataKey="q" tick={{ fontSize: 10, fill: MUTED, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={50} />
          <YAxis
            tick={{ fontSize: 11, fill: MUTED, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            domain={domain}
            tickFormatter={tickFmt}
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const yoy = payload[0]?.payload?.[yoyKey];
              return (
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, fontFamily: "monospace", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ color: MUTED, marginBottom: 4 }}>{label}</div>
                  <div style={{ color }}>{tooltipFmt(payload[0].value)}</div>
                  {yoy !== null && yoy !== undefined && (
                    <div style={{ color: yoy >= 0 ? GREEN : RED, fontSize: 11, marginTop: 2 }}>
                      YoY: {yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "28px 24px", fontFamily: "monospace", color: TEXT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>TOST</span>
          <span style={{ color: MUTED, fontSize: 14, marginLeft: 12 }}>Quarterly Trends · Q3'21 – Q4'25</span>
        </div>
        <div style={{ color: MUTED, fontSize: 11, marginBottom: 28 }}>
          Per-location = avg(beginning + end locations) ÷ 3 for monthly · YoY shown on hover
        </div>

        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Per-Location · Monthly
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="GPV / Location / Month" dataKey="gpvPerLoc" color={BLUE} domain={[0, 'auto']} tickFmt={v => `$${v}K`} tooltipFmt={v => `$${v.toFixed(1)}K`} />
          <Chart title="Sub Revenue / Location / Month" dataKey="subRevPerLoc" color={GREEN} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
          <Chart title="Fintech GP / Location / Month" dataKey="ftGPPerLoc" color={PURPLE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
          <Chart title="Net Rev / Location / Month (Sub + FT GP)" dataKey="netRevPerLoc" color={TEAL} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
        </div>

        <div style={{ color: BLUE, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Aggregate · Quarterly
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="Total Revenue ($M)" dataKey="totalRev" color={ORANGE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v.toLocaleString()}M`} />
          <Chart title="Locations (K)" dataKey="locEnd" color={TEAL} domain={[0, 'auto']} tickFmt={v => `${v}K`} tooltipFmt={v => `${v}K`} />
          <Chart title="GPV ($B)" dataKey="gpv" color={BLUE} domain={[0, 'auto']} tickFmt={v => `$${v}B`} tooltipFmt={v => `$${v.toFixed(1)}B`} />
          <Chart title="Fintech Gross Profit ($M)" dataKey="ftGP" color={PURPLE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}M`} />
        </div>

        <div style={{ color: RED, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Margins & Rates
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="Fintech Take Rate (%)" dataKey="takeRate" color={RED} domain={[2.2, 2.8]} tickFmt={v => `${v.toFixed(1)}%`} tooltipFmt={v => `${v.toFixed(3)}%`} />
          <Chart title="Fintech Gross Margin (%)" dataKey="ftMargin" color={BLUE} domain={[15, 25]} tickFmt={v => `${v}%`} tooltipFmt={v => `${v.toFixed(1)}%`} />
          <Chart title="Sub Gross Margin (%)" dataKey="subMargin" color={GREEN} domain={[55, 80]} tickFmt={v => `${v}%`} tooltipFmt={v => `${v.toFixed(1)}%`} />
        </div>

        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, overflowX: "auto" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Summary Table</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ padding: "6px 8px", textAlign: "left", color: MUTED, fontWeight: 500, position: "sticky", left: 0, background: CARD_BG }}></th>
                {data.map((d, i) => (
                  <th key={i} style={{ padding: "6px 6px", textAlign: "right", color: MUTED, fontWeight: 500, whiteSpace: "nowrap" }}>{d.q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Locations (K)", key: "locEnd", fmt: v => `${v}K` },
                { label: "GPV ($B)", key: "gpv", fmt: v => `$${v.toFixed(1)}B` },
                { label: "Total Rev ($M)", key: "totalRev", fmt: v => `$${v.toLocaleString()}` },
                { label: "Sub Rev ($M)", key: "subRev", fmt: v => `$${v}` },
                { label: "Fintech Rev ($M)", key: "ftRev", fmt: v => `$${v.toLocaleString()}` },
                { label: "Fintech GP ($M)", key: "ftGP", fmt: v => `$${v}` },
                { label: "GPV/Loc/Mo ($K)", key: "gpvPerLoc", fmt: v => `$${v.toFixed(1)}K`, color: BLUE },
                { label: "Sub Rev/Loc/Mo", key: "subRevPerLoc", fmt: v => `$${v}`, color: GREEN },
                { label: "FT GP/Loc/Mo", key: "ftGPPerLoc", fmt: v => `$${v}`, color: PURPLE },
                { label: "Net Rev/Loc/Mo", key: "netRevPerLoc", fmt: v => `$${v}`, color: TEAL },
                { label: "Take Rate", key: "takeRate", fmt: v => `${v.toFixed(3)}%`, color: RED },
                { label: "FT Margin", key: "ftMargin", fmt: v => `${v.toFixed(1)}%` },
                { label: "Sub Margin", key: "subMargin", fmt: v => `${v.toFixed(1)}%` },
              ].map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                  <td style={{ padding: "6px 8px", color: row.color || MUTED, fontWeight: 500, whiteSpace: "nowrap", position: "sticky", left: 0, background: CARD_BG }}>{row.label}</td>
                  {data.map((d, di) => (
                    <td key={di} style={{ padding: "6px 6px", textAlign: "right", color: row.color || TEXT, whiteSpace: "nowrap" }}>
                      {row.fmt(d[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 24, color: MUTED, fontSize: 11 }}>
          Source: Toast 10-Q/10-K filings · Net Rev = Sub Revenue + Fintech GP (excludes PS&HW)
        </div>
      </div>
    </div>
  );
}
