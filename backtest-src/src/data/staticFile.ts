// ─── Bundled data files (src/assets/data) ────────────────────────────────────
// Imported, never fetched: the build inlines them into the single backtester.html,
// which must work when opened straight from disk (file://), where fetch() of local files is blocked.
// Dynamic imports keep the 12.5 MB SIM CSV out of the startup path until a backtest needs it.

const DATA_FILES = {
  letfMap: () => import('../assets/data/letf-map.json?raw'),
  cashMap: () => import('../assets/data/cash-map.json?raw'),
  simCsv: () => import('../assets/data/testfolio-sim.csv?raw'),
  uvixSim0: () => import('../assets/data/uvix-sim0.csv?raw'),
  syntheticMap: () => import('../assets/data/synthetic-map.json?raw'),
} as const

export type DataFile = keyof typeof DATA_FILES

export async function loadDataText(file: DataFile): Promise<string> {
  // Some data files were saved with a byte-order mark, which JSON.parse rejects
  return (await DATA_FILES[file]()).default.replace(/^﻿/, '')
}
