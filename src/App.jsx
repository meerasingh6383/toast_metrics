import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const raw = [
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
    totalRevPerLoc: Math.round(d.totalRev * 1e3 / avgLoc / 3),
    takeRate: Math.round((d.ftRev / (d.gpv * 1e3)) * 1e5) / 1e3,
    ftMargin: Math.round((ftGP / d.ftRev) * 1e3) / 10,
    subMargin: Math.round(((d.subRev - d.subCost) / d.subRev) * 1e3) / 10,
  };
});

const yoyPairs = { 4: 0, 5: 1 };
const yoyGrowth = (key, currIdx) => {
  const priorIdx = yoyPairs[currIdx];
  if (priorIdx === undefined) return null;
  const curr = computed[currIdx][key];
  const prior = computed[priorIdx][key];
  if (!prior) return null;
  return Math.round(((curr - prior) / prior) * 1000) / 10;
};

const allKeys = ["gpvPerLoc", "subRevPerLoc", "ftGPPerLoc", "totalRevPerLoc", "totalRev", "gpv", "locEnd", "ftGP", "takeRate", "ftMargin", "subMargin", "subRev", "ftRev"];
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
          <XAxis dataKey="q" tick={{ fontSize: 12, fill: MUTED, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
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
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} barSize={36}
            label={({ x, y, width, index }) => {
              const yoy = data[index]?.[yoyKey];
              if (yoy === null || yoy === undefined) return null;
              const isPositive = yoy >= 0;
              return (
                <text
                  x={x + width / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="monospace"
                  fontWeight={600}
                  fill={isPositive ? GREEN : RED}
                >
                  YoY {isPositive ? "+" : ""}{yoy.toFixed(1)}%
                </text>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "28px 24px", fontFamily: "monospace", color: TEXT }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>TOST</span>
          <span style={{ color: MUTED, fontSize: 14, marginLeft: 12 }}>Quarterly Trends · Q3'24 – Q4'25</span>
        </div>
        <div style={{ color: MUTED, fontSize: 11, marginBottom: 28 }}>
          Per-location = avg(beginning + end locations) ÷ 3 for monthly
        </div>

        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Per-Location · Monthly
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="GPV / Location / Month" dataKey="gpvPerLoc" color={BLUE} domain={[0, 'auto']} tickFmt={v => `$${v}K`} tooltipFmt={v => `$${v.toFixed(1)}K`} />
          <Chart title="Sub Revenue / Location / Month" dataKey="subRevPerLoc" color={GREEN} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
          <Chart title="Fintech GP / Location / Month" dataKey="ftGPPerLoc" color={PURPLE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
          <Chart title="Total Rev / Location / Month" dataKey="totalRevPerLoc" color={ORANGE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}`} />
        </div>

        <div style={{ color: BLUE, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Aggregate · Quarterly
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="Total Revenue ($M)" dataKey="totalRev" color={ORANGE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v.toLocaleString()}M`} />
          <Chart title="GPV ($B)" dataKey="gpv" color={BLUE} domain={[0, 'auto']} tickFmt={v => `$${v}B`} tooltipFmt={v => `$${v.toFixed(1)}B`} />
          <Chart title="Locations (K)" dataKey="locEnd" color={TEAL} domain={[100, 'auto']} tickFmt={v => `${v}K`} tooltipFmt={v => `${v}K`} />
          <Chart title="Fintech Gross Profit ($M)" dataKey="ftGP" color={PURPLE} domain={[0, 'auto']} tickFmt={v => `$${v}`} tooltipFmt={v => `$${v}M`} />
        </div>

        <div style={{ color: RED, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Margins & Rates
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
          <Chart title="Fintech Take Rate (%)" dataKey="takeRate" color={RED} domain={[2.4, 2.7]} tickFmt={v => `${v.toFixed(1)}%`} tooltipFmt={v => `${v.toFixed(3)}%`} />
          <Chart title="Fintech Gross Margin (%)" dataKey="ftMargin" color={BLUE} domain={[20, 25]} tickFmt={v => `${v}%`} tooltipFmt={v => `${v.toFixed(1)}%`} />
          <Chart title="Sub Gross Margin (%)" dataKey="subMargin" color={GREEN} domain={[68, 76]} tickFmt={v => `${v}%`} tooltipFmt={v => `${v.toFixed(1)}%`} />
        </div>

        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, overflowX: "auto" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Summary Table</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Q4'25"].map((h, i) => (
                  <th key={i} style={{ padding: "6px 10px", textAlign: i === 0 ? "left" : "right", color: MUTED, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Locations (K)", key: "locEnd", fmt: v => `${v}K` },
                { label: "Avg Loc (K)", key: "avgLoc", fmt: v => `${v.toFixed(1)}K` },
                { label: "GPV ($B)", key: "gpv", fmt: v => `$${v.toFixed(1)}B` },
                { label: "Total Rev ($M)", key: "totalRev", fmt: v => `$${v.toLocaleString()}` },
                { label: "Sub Rev ($M)", key: "subRev", fmt: v => `$${v}` },
                { label: "Fintech Rev ($M)", key: "ftRev", fmt: v => `$${v.toLocaleString()}` },
                { label: "Fintech GP ($M)", key: "ftGP", fmt: v => `$${v}` },
                { label: "GPV/Loc/Mo ($K)", key: "gpvPerLoc", fmt: v => `$${v.toFixed(1)}K`, color: BLUE },
                { label: "Sub Rev/Loc/Mo", key: "subRevPerLoc", fmt: v => `$${v}`, color: GREEN },
                { label: "FT GP/Loc/Mo", key: "ftGPPerLoc", fmt: v => `$${v}`, color: PURPLE },
                { label: "Total Rev/Loc/Mo", key: "totalRevPerLoc", fmt: v => `$${v}`, color: ORANGE },
                { label: "Take Rate", key: "takeRate", fmt: v => `${v.toFixed(3)}%`, color: RED },
                { label: "FT Margin", key: "ftMargin", fmt: v => `${v.toFixed(1)}%` },
                { label: "Sub Margin", key: "subMargin", fmt: v => `${v.toFixed(1)}%` },
              ].map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                  <td style={{ padding: "6px 10px", color: row.color || MUTED, fontWeight: 500 }}>{row.label}</td>
                  {data.map((d, di) => (
                    <td key={di} style={{ padding: "6px 10px", textAlign: "right", color: row.color || TEXT }}>
                      {row.fmt(d[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
