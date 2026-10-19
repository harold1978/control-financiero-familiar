/**
 * Gráfico de barras horizontal sin dependencias externas.
 *
 * Cada fila puede tener una o dos series (por ejemplo: gasto real y proyectado).
 * El valor siempre se muestra en texto: la información nunca depende solo del color.
 */
import { Text, View } from 'react-native';
import { barFillStyle, styles, swatchStyle } from '../styles/styles';

export interface ChartSeries {
  label: string;
  color: string;
  values: number[];
}

interface BarChartProps {
  /** Etiquetas de cada fila (nombres de categoría, periodicidades…). */
  labels: string[];
  series: ChartSeries[];
  /** Convierte el valor numérico a texto (por ejemplo moneda). */
  formatValue: (value: number) => string;
  /** Valor máximo del eje. Si no se indica se usa el mayor de todas las series. */
  maxValue?: number;
}

export function BarChart({ labels, series, formatValue, maxValue }: BarChartProps) {
  const scale = maxValue ?? Math.max(0, ...series.flatMap((item) => item.values));
  const showLegend = series.length > 1;

  return (
    <View style={styles.chart}>
      {labels.map((label, rowIndex) => {
        const rowValues = series.map((item) => item.values[rowIndex] ?? 0);
        const description = series
          .map((item, index) => `${item.label}: ${formatValue(rowValues[index] ?? 0)}`)
          .join(', ');

        return (
          <View
            key={label}
            style={styles.chartRow}
            accessible
            accessibilityLabel={`${label}. ${description}`}
          >
            <View style={styles.chartRowHeader}>
              <Text style={styles.chartLabel} numberOfLines={2}>
                {label}
              </Text>
              <Text style={styles.chartValue}>
                {rowValues.map((value) => formatValue(value)).join(' / ')}
              </Text>
            </View>

            {series.map((item, seriesIndex) => {
              const value = rowValues[seriesIndex] ?? 0;
              const percent = scale > 0 ? (value / scale) * 100 : 0;

              return (
                <View key={`${item.label}-${label}`} style={[styles.chartTrack, showLegend && styles.chartTrackThin]}>
                  <View style={[styles.chartFill, barFillStyle(percent, item.color)]} />
                </View>
              );
            })}
          </View>
        );
      })}

      {showLegend ? (
        <View style={styles.chartLegend}>
          {series.map((item) => (
            <View key={item.label} style={styles.chartLegendItem}>
              <View style={swatchStyle(item.color)} />
              <Text style={styles.chartLegendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
