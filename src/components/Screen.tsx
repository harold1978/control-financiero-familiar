/**
 * Contenedor estándar de cada pantalla: área con desplazamiento y ancho
 * máximo centrado para que en escritorio el contenido no se estire en exceso.
 */
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { styles } from '../styles/styles';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={styles.contentScroll}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.page}>{children}</View>
    </ScrollView>
  );
}
