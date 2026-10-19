/**
 * Gráfica de uso de un ingreso: 10 puntos (● / ○) con el porcentaje ya gastado.
 * Reproduce la columna "Grafica Uso" de la hoja de cálculo original.
 */
import { Text, View } from 'react-native';
import { dotStyle, styles, tones } from '../styles/styles';
import { formatPercent } from '../utils/money';

interface UsageIndicatorProps {
  /** Monto del ingreso ya destinado a gastos. */
  used: number;
  /** Monto total del ingreso. */
  total: number;
  /** Relación usada/total, entre 0 y 1. */
  ratio: number;
  format: (value: number) => string;
  /** Texto de la cabecera (por ejemplo "Utilizado de este presupuesto"). */
  label?: string;
}

const DOTS = 10;

export function UsageIndicator({ used, total, ratio, format, label = 'Utilizado de este ingreso' }: UsageIndicatorProps) {
  const percent = formatPercent(ratio, 0);
  const activeDots = Math.round(ratio * DOTS);
  const tone = ratio >= 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'info';
  const color = tones[tone].foreground;

  return (
    <View
      style={styles.usageBox}
      accessible
      accessibilityLabel={`${activeDots} de ${DOTS} puntos, ${percent} del ingreso utilizado: ${format(used)} de ${format(total)}`}
    >
      <View style={styles.usageHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.usagePercent}>{percent}</Text>
      </View>

      <View style={styles.usageDots}>
        {Array.from({ length: DOTS }, (_, index) => (
          <View key={index} style={[styles.dot, dotStyle(index < activeDots, color)]} />
        ))}
      </View>

      <Text style={styles.textMuted}>{`${format(used)} de ${format(total)}`}</Text>
    </View>
  );
}
