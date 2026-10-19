/** Tarjeta: contenedor estándar de todos los bloques de contenido. */
import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../styles/styles';

interface CardProps {
  title?: string;
  /** Elemento alineado a la derecha del título (normalmente un botón). */
  action?: ReactNode;
  children: ReactNode;
  /** Reduce el relleno interno (para listas cortas). */
  tight?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, action, children, tight = false, style }: CardProps) {
  const hasHeader = Boolean(title) || Boolean(action);

  return (
    <View style={[styles.card, tight && styles.cardTight, style]}>
      {hasHeader ? (
        <View style={styles.cardHeader}>
          {title ? (
            <Text style={styles.cardTitle} accessibilityRole="header">
              {title}
            </Text>
          ) : (
            <View style={styles.grow} />
          )}
          {action}
        </View>
      ) : null}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}
