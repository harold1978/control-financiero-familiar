/** Información de tamaño de pantalla para adaptar el diseño (móvil, tableta, escritorio). */
import { useWindowDimensions } from 'react-native';
import { breakpoints } from '../styles/styles';

export interface ResponsiveInfo {
  /** Ancho actual de la ventana. */
  width: number;
  /** Alto actual de la ventana. */
  height: number;
  /** Pantalla pequeña: se usan listas compactas. */
  isCompact: boolean;
  /** Por debajo de tableta: navegación inferior y tarjetas apiladas. */
  isNarrow: boolean;
  /** Escritorio: se muestra la navegación lateral. */
  useSidebar: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isCompact: width < breakpoints.sm,
    isNarrow: width < breakpoints.md,
    useSidebar: width >= breakpoints.lg,
  };
}
