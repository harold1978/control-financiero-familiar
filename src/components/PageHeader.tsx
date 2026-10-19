/** Encabezado de cada pantalla: título, descripción y acciones principales. */
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Botones de la pantalla (por ejemplo "Nuevo ingreso"). */
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={styles.pageDescription}>{description}</Text> : null}
      {action ? <View style={styles.pageHeaderActions}>{action}</View> : null}
    </View>
  );
}
