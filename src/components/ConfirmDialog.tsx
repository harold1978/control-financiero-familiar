import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { ModalCard } from './ModalCard';
import { styles } from '../styles/styles';

/**
 * Diálogo de confirmación multiplataforma.
 * Se usa en lugar de Alert.alert porque React Native no muestra alertas en web.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): React.ReactElement {
  return (
    <ModalCard visible={visible} title={title} onClose={onCancel} small>
      <View style={styles.confirmBody}>
        <Text style={styles.confirmMessage}>{message}</Text>
        <View style={styles.confirmActions}>
          <Button
            label={cancelLabel}
            variant="secondary"
            size="small"
            onPress={onCancel}
            disabled={loading}
          />
          <Button
            label={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            size="small"
            onPress={onConfirm}
            loading={loading}
          />
        </View>
      </View>
    </ModalCard>
  );
}
