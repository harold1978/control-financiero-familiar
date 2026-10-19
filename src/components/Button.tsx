/**
 * Botón reutilizable con variantes, icono y estados de accesibilidad.
 * El área táctil mínima es de 44 px (WCAG 2.5.5).
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors, styles } from '../styles/styles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'small' | 'normal';
  icon?: IconName;
  disabled?: boolean;
  /** Muestra un indicador de progreso (la acción es asíncrona). */
  loading?: boolean;
  /** Texto alternativo para lectores de pantalla. */
  accessibilityLabel?: string;
}

const CONTAINER_STYLES: Record<ButtonVariant, ViewStyle> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  danger: styles.buttonDanger,
  ghost: styles.buttonGhost,
};

/** Los iconos necesitan un color en crudo (no pueden recibir estilos). */
const ICON_COLORS: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.primary,
  danger: colors.textInverse,
  ghost: colors.primary,
};

const TEXT_STYLES: Record<ButtonVariant, StyleProp<TextStyle>> = {
  primary: styles.buttonText,
  secondary: [styles.buttonText, styles.buttonTextSecondary],
  danger: styles.buttonTextDanger,
  ghost: [styles.buttonText, styles.buttonTextSecondary],
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'normal',
  icon,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const busy = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: busy }}
      style={[
        styles.button,
        CONTAINER_STYLES[variant],
        size === 'small' && styles.buttonSmall,
        busy && styles.buttonDisabled,
        !busy && pressed && styles.buttonPressed,
        focused && styles.buttonFocused,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={ICON_COLORS[variant]} />
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={18} color={ICON_COLORS[variant]} />
      ) : null}
      <Text style={TEXT_STYLES[variant]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
