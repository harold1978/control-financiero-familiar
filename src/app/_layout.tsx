/**
 * Raíz de la aplicación: proveedores globales y navegador principal.
 *
 * - SafeAreaProvider: áreas seguras en Android/iOS.
 * - AppProvider: suscripción a Firestore y estado compartido.
 * - AppShell: barra superior, navegación lateral/inferior y avisos globales.
 * - Stack: las pantallas de src/app/ (sin cabecera nativa: la proporciona el shell).
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppShell } from '../components/AppShell';
import { AppProvider } from '../context/AppContext';
import { colors } from '../styles/styles';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppShell>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </AppShell>
      </AppProvider>
    </SafeAreaProvider>
  );
}
