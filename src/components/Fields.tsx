/**
 * Campos de formulario: texto, área de texto y selector desplegable.
 * Todos comparten etiqueta visible, mensaje de error y etiquetas para
 * lectores de pantalla.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { colors, styles } from '../styles/styles';

interface BaseFieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  /** Texto para lectores de pantalla; si falta se usa la etiqueta. */
  accessibilityLabel?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  /** Fuerza el formato de fecha AAAA-MM-DD en teclados numéricos. */
  editable?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  editable = true,
  accessibilityLabel,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel} nativeID={`${label}-label`}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        editable={editable}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? hint}
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          focused && styles.fieldInputFocused,
          error ? styles.fieldInputError : null,
        ]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Selector desplegable propio (funciona igual en Android y en web)
 * que evita depender de librerías nativas de menús.
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleccionar…',
  error,
  hint,
  accessibilityLabel,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const displayValue = selected?.label ?? placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${label}: ${displayValue}`}
        accessibilityHint={error ?? hint}
        style={[
          styles.selectButton,
          focusedStyle(error),
        ]}
      >
        <Text
          style={[styles.selectButtonText, !selected && styles.selectButtonPlaceholder]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <MaterialCommunityIcons name="menu-down" size={20} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                {label}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={[styles.iconButton, styles.iconButtonGhost]}
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector"
              >
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.optionList}>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={[styles.optionItem, isSelected && styles.optionItemActive]}
                    >
                      <Text
                        style={[styles.optionItemText, isSelected && styles.optionItemTextActive]}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                      {isSelected ? (
                        <MaterialCommunityIcons name="check-bold" size={18} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Borde de error compartido por los botones de selector. */
function focusedStyle(error?: string | null) {
  return error ? styles.fieldInputError : null;
}
