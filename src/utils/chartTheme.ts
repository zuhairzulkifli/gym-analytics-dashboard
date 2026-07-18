// Shared Recharts theming so every chart in the app matches the dark
// editorial palette instead of Recharts' defaults (a white tooltip popup,
// unstyled gray axis ticks) which would clash hard against a near-black UI.
export const CHART_AXIS_TICK = { fontSize: 10, fill: "#a89a83" }; // ink-muted

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#2b241b", // surface-raised
    border: "1px solid #382f22", // surface-border
    borderRadius: "8px",
    fontSize: "12px"
  },
  labelStyle: { color: "#f2ead9" }, // ink
  itemStyle: { color: "#f2ead9" } // ink
};
