import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles/styles';

/**
 * ModalCard: modal accesible que se comporta igual en Android y en web.
 * - El área de fondo (modalBackdropTouch) cierra la ventana al tocar, como el "backdrop" web.
 * - accessibilityRole="dialog" para lectores de pantalla.
 * - El contenido desbordante hace scroll dentro de la tarjeta.
 */
export function ModalCard({
  visible,
  title,
  onClose,
  children,
  footer,
  small = false,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  small?: boolean;
}): React.ReactElement {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar ventana"
          onPress={onClose}
          style={styles.modalBackdropTouch}
        />
        <View
          style={[styles.modalCard, small && styles.modalCardSmall]}
          accessibilityRole="dialog"
          accessibilityLabel={title}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={12}
              style={styles.iconButton}
            >
              <Text style={styles.text}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalBodyScroll}
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.modalFooter}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
