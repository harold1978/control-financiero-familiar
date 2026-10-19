/** Estados visuales compartidos: carga, vacío, error e información. */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, styles } from '../styles/styles';
import { Button } from './Button';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Indicador de carga centrado. */
export function LoadingState({ message = 'Cargando datos…' }: { message?: string }) {
  return (
    <View style={styles.loadingBox} accessible accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

/** Mensaje cuando aún no hay registros que mostrar. */
export function EmptyState({
  icon = 'inbox-outline',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyBox}>
      <MaterialCommunityIcons name={icon} size={36} color={colors.textMuted} />
      <Text style={styles.emptyTitle} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={styles.emptyText}>{description}</Text> : null}
      {action}
    </View>
  );
}

/** Banner de error con acción de reintento. */
export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox} accessible accessibilityRole="alert">
      <Text style={styles.errorTitle}>No se pudieron cargar los datos</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Button label="Reintentar" variant="secondary" size="small" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

/** Banner informativo (configuración, avisos de la aplicación). */
export function NoticeBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}
