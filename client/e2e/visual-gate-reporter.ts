import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export interface MeasurementRecord {
  num: number;
  name: string;
  measured: string;
  threshold: string;
  status: 'PASS' | 'FAIL' | 'INCONCLUSO';
  dispersion?: string;
  details?: string;
}

// Global store to collect results across tests
export const gateResults: MeasurementRecord[] = [];

export default class VisualGateReporter implements Reporter {
  onBegin(_config: FullConfig, _suite: Suite) {
    gateResults.length = 0;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const attachment = result.attachments.find((a) => a.name === 'measurement-result');
    if (attachment && attachment.body) {
      try {
        const record = JSON.parse(attachment.body.toString('utf-8')) as MeasurementRecord;
        const existingIdx = gateResults.findIndex((r) => r.num === record.num);
        if (existingIdx >= 0) {
          gateResults[existingIdx] = record;
        } else {
          gateResults.push(record);
        }
      } catch {
        // Fallback
      }
    }
  }

  onEnd(result: FullResult) {
    gateResults.sort((a, b) => a.num - b.num);

    console.log('\n========================================================================================================================');
    console.log('                                  T012 · GATE DE MEDICIÓN EN NAVEGADOR (DD-038)');
    console.log('========================================================================================================================\n');

    const colNum = 4;
    const colName = 48;
    const colVal = 18;
    const colThresh = 30;
    const colStatus = 12;

    const pad = (str: string, len: number, align: 'left' | 'right' = 'left') => {
      const s = String(str);
      if (s.length >= len) return s.slice(0, len);
      return align === 'right' ? s.padStart(len, ' ') : s.padEnd(len, ' ');
    };

    const header = `│ ${pad('#', colNum)} │ ${pad('Medición', colName)} │ ${pad('Valor medido', colVal)} │ ${pad('Umbral', colThresh)} │ ${pad('Estado', colStatus)} │`;
    const sep = `├─${'─'.repeat(colNum)}─┼─${'─'.repeat(colName)}─┼─${'─'.repeat(colVal)}─┼─${'─'.repeat(colThresh)}─┼─${'─'.repeat(colStatus)}─┤`;
    const top = `┌─${'─'.repeat(colNum)}─┬─${'─'.repeat(colName)}─┬─${'─'.repeat(colVal)}─┬─${'─'.repeat(colThresh)}─┬─${'─'.repeat(colStatus)}─┐`;
    const bot = `└─${'─'.repeat(colNum)}─┴─${'─'.repeat(colName)}─┴─${'─'.repeat(colVal)}─┴─${'─'.repeat(colThresh)}─┴─${'─'.repeat(colStatus)}─┘`;

    console.log(top);
    console.log(header);
    console.log(sep);

    for (const r of gateResults) {
      const numStr = String(r.num).padStart(2, '0');
      const row = `│ ${pad(numStr, colNum, 'right')} │ ${pad(r.name, colName)} │ ${pad(r.measured, colVal)} │ ${pad(r.threshold, colThresh)} │ ${pad(r.status, colStatus)} │`;
      console.log(row);
    }
    console.log(bot);

    const fails = gateResults.filter((r) => r.status === 'FAIL');
    const inconclusos = gateResults.filter((r) => r.status === 'INCONCLUSO');
    const passes = gateResults.filter((r) => r.status === 'PASS');

    console.log(`\nResumen: ${passes.length} PASS · ${fails.length} FAIL · ${inconclusos.length} INCONCLUSO (Total: ${gateResults.length}/13)`);

    if (fails.length > 0 || inconclusos.length > 0) {
      console.log('\n--- DETALLE DE DESVIACIONES Y DISPERSIONES ---');
      for (const f of [...fails, ...inconclusos]) {
        console.log(`\n[${f.status}] Medición ${f.num}: ${f.name}`);
        console.log(`  - Valor medido: ${f.measured}`);
        console.log(`  - Umbral:       ${f.threshold}`);
        if (f.dispersion) {
          console.log(`  - Dispersión:   ${f.dispersion}`);
        }
        if (f.details) {
          console.log(`  - Detalles:     ${f.details}`);
        }
      }
      console.log('\n========================================================================================================================\n');
    } else {
      console.log('\n========================================================================================================================\n');
    }
  }
}
