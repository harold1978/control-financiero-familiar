/**
 * Estructura común de toda la aplicación (shell responsiva):
 *
 *  - Escritorio (>= 1024 px): barra lateral fija con la navegación completa.
 *  - Móvil/tablet: barra superior con el estado de conexión y barra de
 *    pestañas inferior con los seis destinos principales.
 *  - Dentro del contenido se muestran de forma global: el aviso de privacidad,
 *    el aviso de error de conexión y el aviso de configuración de Firebase.
 *
 * La navegación es interna (botones + router) para que el mismo componente
 * funcione igual en Android y en web sin depender de librerías de menús.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../hooks/useResponsive';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { colors, styles } from '../styles/styles';
import { Badge } from './Badge';
import { ErrorBox, NoticeBox } from './Feedback';
import { PrivacyBanner } from './PrivacyBanner';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Destinos principales en el orden en que aparecen en la hoja original. */
const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', icon: 'view-dashboard-outline' },
  { href: '/ingresos', label: 'Ingresos', icon: 'cash-multiple' },
  { href: '/gastos', label: 'Gastos', icon: 'cash-minus' },
  { href: '/presupuesto', label: 'Presupuesto', icon: 'chart-box-outline' },
  { href: '/categorias', label: 'Categorías', icon: 'tag-multiple-outline' },
  { href: '/ajustes', label: 'Ajustes', icon: 'cog-outline' },
];

/** Rutas que no aparecen en la navegación (se llega desde otra pantalla). */
const EXTRA_ROUTES: Record<string, string> = {
  '/privacidad': 'Privacidad',
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { useSidebar } = useResponsive();
  const app = useApp();
  const acceptAction = useAsyncAction();
  const rejectAction = useAsyncAction();

  const currentLabel =
    NAV_ITEMS.find((item) => isActiveRoute(pathname, item.href))?.label ??
    EXTRA_ROUTES[pathname] ??
    'Inicio';

  const status: { label: string; tone: 'success' | 'warning' | 'info' | 'danger' } = !app.configured
    ? { label: 'Sin configurar', tone: 'warning' }
    : app.loading
      ? { label: 'Cargando…', tone: 'info' }
      : app.error
        ? { label: 'Sin conexión', tone: 'danger' }
        : { label: 'Conectado', tone: 'success' };

  const goTo = (href: string) => {
    if (!isActiveRoute(pathname, href)) router.push(href);
  };

  const renderNavItem = (item: NavItem, variant: 'sidebar' | 'bottom') => {
    const active = isActiveRoute(pathname, item.href);
    const isSidebar = variant === 'sidebar';

    return (
      <Pressable
        key={item.href}
        onPress={() => goTo(item.href)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
        style={
          isSidebar
            ? [styles.navItem, active && styles.navItemActive]
            : [styles.bottomBarItem, active && styles.bottomBarItemActive]
        }
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={isSidebar ? 22 : 22}
          color={active ? colors.primaryHover : colors.textSecondary}
        />
        <Text
          style={
            isSidebar
              ? [styles.navItemLabel, active && styles.navItemLabelActive]
              : [styles.bottomBarLabel, active && styles.bottomBarLabelActive]
          }
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.shell}>
      {/* Barra superior: marca, pantalla actual y estado de la conexión. */}
      <View style={styles.topBar}>
        <View style={styles.topBarTitles}>
          {!useSidebar ? <Text style={styles.topBarBrand}>CONTROL FINANCIERO FAMILIAR</Text> : null}
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {useSidebar ? 'Control Financiero Familiar' : currentLabel}
          </Text>
          {useSidebar ? (
            <Text style={styles.topBarSubtitle} numberOfLines={1}>
              {currentLabel}
            </Text>
          ) : null}
        </View>
        <Badge label={status.label} tone={status.tone} />
      </View>

      <View style={styles.shellMain}>
        {/* Navegación lateral en pantallas anchas. */}
        {useSidebar ? (
          <SafeAreaView style={styles.sidebar} edges={['left', 'bottom']}>
            <View style={styles.sidebarBrand}>
              <Text style={styles.sidebarBrandTitle}>Menú</Text>
              <Text style={styles.sidebarBrandSubtitle}>Sección actual: {currentLabel}</Text>
            </View>
            <View style={styles.navList} accessibilityRole="tablist">
              {NAV_ITEMS.map((item) => renderNavItem(item, 'sidebar'))}
            </View>
            <View style={styles.sidebarFooter}>
              <Text style={styles.textMuted}>
                Sin autenticación: protege el acceso al proyecto de Firebase.
              </Text>
            </View>
          </SafeAreaView>
        ) : null}

        <View style={styles.shellColumn}>
          {/* Avisos globales, siempre visibles sobre la pantalla activa. */}
          <View style={styles.globalArea}>
            {!app.configured ? (
              <NoticeBox title="Firebase sin configurar">
                Falta la configuración de Firebase ({app.missingKeys.join(', ')}). Copia
                .env.example a .env, completa tus credenciales y reinicia el servidor para
                comenzar a guardar datos.
              </NoticeBox>
            ) : null}

            {app.error ? <ErrorBox message={app.error} onRetry={app.reload} /> : null}

            {app.configured && app.privacyPending ? (
              <PrivacyBanner
                loading={acceptAction.busy || rejectAction.busy}
                onRead={() => router.push('/privacidad')}
                onAccept={() => acceptAction.run(() => app.acceptPrivacy())}
                onReject={() => rejectAction.run(() => app.revokePrivacy())}
              />
            ) : null}
          </View>

          {/* El navegador (Stack) ocupa el resto del alto y cada pantalla
              decide su propio desplazamiento. */}
          <View style={styles.grow}>{children}</View>
        </View>
      </View>

      {/* Navegación inferior en pantallas angostas (patrón de apps móviles). */}
      {!useSidebar ? (
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          {NAV_ITEMS.map((item) => renderNavItem(item, 'bottom'))}
        </SafeAreaView>
      ) : null}
    </View>
  );
}
