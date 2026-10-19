/** Etiqueta de estado (badge) con color y texto: nunca se comunica solo por color. */
import { Text, View } from 'react-native';
import { badgeStyle, type Tone } from '../styles/styles';

export function Badge({
  label,
  tone = 'neutral',
  accessibilityLabel,
}: {
  label: string;
  tone?: Tone;
  accessibilityLabel?: string;
}) {
  const style = badgeStyle(tone);

  return (
    <View style={style.container} accessible accessibilityLabel={accessibilityLabel ?? label}>
      <Text style={style.text}>{label}</Text>
    </View>
  );
}
