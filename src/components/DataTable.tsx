/**
 * Tabla responsiva con desplazamiento horizontal.
 *
 * En pantallas estrechas la tabla se puede recorrer de lado a lado; en
 * pantallas amplias las columnas flexibles ocupan todo el ancho disponible.
 * El estilo de cada columna se referencia desde el archivo único de estilos.
 */
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { styles } from '../styles/styles';
import { EmptyState } from './Feedback';

/** Anchos fijos disponibles para las columnas (definidos en styles.ts). */
export type TableColumnWidth = Extract<keyof typeof styles, `col${string}`>;

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Ancho de la columna; si se omite la columna ocupa el espacio restante. */
  width?: TableColumnWidth;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyTitle, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="table-large"
        title={emptyTitle ?? 'Sin datos'}
        description={emptyMessage ?? 'Todavía no hay información para mostrar en la tabla.'}
      />
    );
  }

  const cellStyle = (column: TableColumn<T>) => [
    styles.tableCell,
    column.width ? styles[column.width] : null,
    column.align === 'right' ? styles.alignRight : null,
  ];

  return (
    <View style={styles.tableCard}>
      <ScrollView horizontal style={styles.tableScroll} contentContainerStyle={styles.tableContent}>
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeaderRow}>
            {columns.map((column) => (
              <View key={column.key} style={cellStyle(column)}>
                <Text style={styles.tableHeaderText} numberOfLines={1}>
                  {column.header}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, index) => (
            <View
              key={rowKey(row)}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
                index === rows.length - 1 && styles.tableRowLast,
              ]}
            >
              {columns.map((column) => (
                <View key={column.key} style={cellStyle(column)}>
                  {column.render(row)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
