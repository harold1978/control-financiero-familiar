/** Cifra destacada del dashboard (ingresos, gastos, balance). */
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../styles/styles';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, hint, style }: StatCardProps) {
  return (
    <View style={[styles.card, styles.statCard, style]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statCardLabel}>{label}</Text>
      <Text style={styles.statCardValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text style={styles.statCardHint}>{hint}</Text> : null}
    </View>
  );
}
