import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ProcedureTableRow } from '@/lib/buildReportData';

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'column',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  rowText: {
    fontSize: 10,
    color: '#1e293b',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' as const },
  colTrend: { flex: 1, textAlign: 'center' as const },
  colValue: { flex: 1.5, textAlign: 'right' as const },
  trendPositive: { color: '#10b981' },
  trendNegative: { color: '#ef4444' },
  trendNeutral: { color: '#64748b' },
});

interface ProcedureTableProps {
  data: ProcedureTableRow[];
}

export function ProcedureTable({ data }: ProcedureTableProps) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.colDesc]}>Procedimento</Text>
        <Text style={[styles.headerText, styles.colQty]}>Qtd</Text>
        <Text style={[styles.headerText, styles.colTrend]}>Tendência</Text>
        <Text style={[styles.headerText, styles.colValue]}>Faturamento</Text>
      </View>

      {data.map((item, index) => {
        const isPositive = item.tendencia.includes('+');
        const isNegative = item.tendencia.includes('-') && !item.tendencia.startsWith('+');
        const trendStyle = isPositive
          ? styles.trendPositive
          : isNegative
            ? styles.trendNegative
            : styles.trendNeutral;

        return (
          <View
            key={index}
            style={index < data.length - 1 ? styles.tableRow : styles.tableRowLast}
          >
            <Text style={[styles.rowText, styles.colDesc]}>{item.procedimento}</Text>
            <Text style={[styles.rowText, styles.colQty]}>{item.qtd}</Text>
            <Text style={[styles.rowText, styles.colTrend, trendStyle]}>
              {item.tendencia}
            </Text>
            <Text style={[styles.rowText, styles.colValue]}>{item.receita}</Text>
          </View>
        );
      })}
    </View>
  );
}
