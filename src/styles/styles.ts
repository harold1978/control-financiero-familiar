/**
 * Archivo único de estilos del proyecto.
 *
 * Reglas del proyecto:
 *  - Aquí se definen TODOS los estilos de la aplicación (StyleSheet y tokens de diseño).
 *  - Las pantallas y componentes solo importan desde este archivo; no crean StyleSheet.create propios.
 *  - Los estilos que dependen de valores dinámicos (ancho de una barra, color de un estado)
 *    se exportan como "fábricas de estilos" al final del archivo.
 *
 * Accesibilidad (WCAG 2.1 AA):
 *  - Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande/controles.
 *  - Áreas táctiles de al menos 44x44 px (minHitTarget).
 *  - La información nunca se comunica solo con color: siempre acompaña texto o icono.
 */
import { Platform, StyleSheet, type DimensionValue, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

/* -------------------------------------------------------------------------- */
/* 1. Tokens de diseño                                                         */
/* -------------------------------------------------------------------------- */

export const colors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  primary: '#1D4ED8',
  primaryHover: '#1E40AF',
  primarySoft: '#DBEAFE',

  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  info: '#0369A1',
  infoSoft: '#E0F2FE',
  neutral: '#334155',
  neutralSoft: '#E2E8F0',

  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  smallBold: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: '600' as const },
} as const;

/** Puntos de quiebre para el diseño responsivo (web y tabletas). */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const layout = {
  sidebarWidth: 250,
  contentMaxWidth: 1160,
  topBarHeight: 64,
  bottomBarHeight: 64,
  minHitTarget: 44,
} as const;

/** Estados visuales compartidos (badge, semáforo, avisos). */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const tones: Record<Tone, { foreground: string; background: string }> = {
  success: { foreground: colors.success, background: colors.successSoft },
  warning: { foreground: colors.warning, background: colors.warningSoft },
  danger: { foreground: colors.danger, background: colors.dangerSoft },
  info: { foreground: colors.info, background: colors.infoSoft },
  neutral: { foreground: colors.neutral, background: colors.neutralSoft },
};

/** Paleta de colores para gráficos (diferenciables y con contraste suficiente). */
export const chartPalette = [
  colors.primary,
  colors.success,
  colors.warning,
  colors.info,
  '#7C3AED',
  '#BE185D',
  '#0F766E',
  '#475569',
  '#B45309',
  '#0891B2',
  '#4338CA',
  '#15803D',
] as const;

export const chartColor = (index: number): string =>
  chartPalette[index % chartPalette.length];

/* -------------------------------------------------------------------------- */
/* 2. Estilos                                                                  */
/* -------------------------------------------------------------------------- */

export const styles = StyleSheet.create({
  /* ------------------------------- Base ---------------------------------- */
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: { ...typography.body, color: colors.text },
  textBold: { ...typography.bodyBold, color: colors.text },
  textSecondary: { ...typography.body, color: colors.textSecondary },
  textMuted: { ...typography.small, color: colors.textMuted },
  textInverse: { ...typography.body, color: colors.textInverse },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  linkText: { ...typography.bodyBold, color: colors.primary, textDecorationLine: 'underline' },

  /* ------------------------- Estructura de la app ------------------------ */
  shell: { flex: 1, backgroundColor: colors.background },
  shellMain: { flex: 1, flexDirection: 'row', minWidth: 0 },
  shellColumn: { flex: 1, minWidth: 0 },

  topBar: {
    minHeight: layout.topBarHeight,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topBarTitles: { flexShrink: 1 },
  topBarTitle: { ...typography.subtitle, color: colors.text },
  topBarSubtitle: { ...typography.small, color: colors.textMuted },
  topBarBrand: { ...typography.micro, color: colors.primary, letterSpacing: 0.6 },

  contentScroll: { flex: 1 },
  contentInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  /** Avisos globales (privacidad, error, configuración) sobre el contenido. */
  globalArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    gap: spacing.md,
  },

  /* ------------------------- Navegación lateral -------------------------- */
  sidebar: {
    width: layout.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sidebarBrand: { paddingHorizontal: spacing.sm, paddingBottom: spacing.lg },
  sidebarBrandTitle: { ...typography.subtitle, color: colors.text },
  sidebarBrandSubtitle: { ...typography.small, color: colors.textMuted },
  navList: { gap: spacing.xs },
  navItem: {
    minHeight: layout.minHitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  navItemActive: { backgroundColor: colors.primarySoft },
  navItemLabel: { ...typography.body, color: colors.textSecondary, flexShrink: 1 },
  navItemLabelActive: { color: colors.primaryHover, fontWeight: '600' },
  sidebarFooter: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  /* -------------------------- Navegación inferior ------------------------ */
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingBottom: Platform.select({ web: 0, default: 4 }),
  },
  bottomBarItem: {
    flex: 1,
    minHeight: layout.bottomBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  bottomBarItemActive: { backgroundColor: colors.primarySoft },
  bottomBarLabel: { ...typography.micro, color: colors.textMuted, textAlign: 'center' },
  bottomBarLabelActive: { color: colors.primaryHover },

  /* ----------------------------- Páginas --------------------------------- */
  page: { gap: spacing.xl },
  pageHeader: { gap: spacing.xs },
  pageTitle: { ...typography.title, color: colors.text },
  pageDescription: { ...typography.body, color: colors.textSecondary, maxWidth: 760 },
  pageHeaderActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: { gap: spacing.lg },
  sectionHeader: { gap: spacing.xs },
  sectionTitle: { ...typography.subtitle, color: colors.text },
  sectionDescription: { ...typography.small, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  grow: { flex: 1, minWidth: 0 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  footnote: { ...typography.small, color: colors.textMuted, maxWidth: 760 },

  /* ------------------------------ Tarjetas -------------------------------- */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)' },
      default: { elevation: 1 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { ...typography.subtitle, color: colors.text, flexShrink: 1 },
  cardBody: { gap: spacing.md },
  cardTight: { padding: spacing.md, gap: spacing.sm },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  gridItem: { flexGrow: 1, flexBasis: 260, minWidth: 240, maxWidth: '100%' },
  statCard: { gap: spacing.xs },
  statCardLabel: { ...typography.smallBold, color: colors.textSecondary },
  statCardValue: { ...typography.display, color: colors.text },
  statCardHint: { ...typography.small, color: colors.textMuted },

  summaryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryItem: { flexGrow: 1, flexBasis: 150, gap: 2 },
  summaryLabel: { ...typography.small, color: colors.textMuted },
  summaryValue: { ...typography.bodyBold, color: colors.text },

  /* ------------------------------ Botones --------------------------------- */
  button: {
    minHeight: layout.minHitTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  buttonDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
  buttonGhost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.72 },
  buttonFocused: {
    ...Platform.select({
      web: { boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.45)' },
      default: {},
    }),
  },
  buttonSmall: { minHeight: 36, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  buttonText: { ...typography.bodyBold, color: colors.textInverse, textAlign: 'center' },
  buttonTextSecondary: { color: colors.primary },
  buttonTextDanger: { ...typography.bodyBold, color: colors.textInverse, textAlign: 'center' },
  iconButton: {
    minWidth: layout.minHitTarget,
    minHeight: layout.minHitTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  iconButtonGhost: { backgroundColor: 'transparent' },
  iconButtonDanger: { backgroundColor: colors.dangerSoft },

  /* ------------------------------ Formularios ----------------------------- */
  form: { gap: spacing.lg },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.smallBold, color: colors.textSecondary },
  fieldInput: {
    minHeight: layout.minHitTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  fieldInputFocused: { borderColor: colors.primary, borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  fieldInputError: { borderColor: colors.danger },
  fieldInputMultiline: { minHeight: 96, paddingTop: spacing.sm, textAlignVertical: 'top' },
  fieldError: { ...typography.small, color: colors.danger },
  fieldHint: { ...typography.small, color: colors.textMuted },
  fieldRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  fieldColumn: { flexGrow: 1, flexBasis: 220, minWidth: 180, gap: spacing.xs },
  selectButton: {
    minHeight: layout.minHitTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectButtonText: { ...typography.body, color: colors.text, flexShrink: 1 },
  selectButtonPlaceholder: { color: colors.textMuted },

  /* ------------------------------- Modales -------------------------------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  /** Área transparente a pantalla completa detrás del modal (cierra al tocar). */
  modalBackdropTouch: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalCardSmall: { maxWidth: 440 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.subtitle, color: colors.text, flexShrink: 1 },
  modalBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.lg },
  modalBodyScroll: { maxHeight: 420 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  optionList: { gap: spacing.xs },
  optionItem: {
    minHeight: layout.minHitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionItemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionItemText: { ...typography.body, color: colors.text, flexShrink: 1 },
  optionItemTextActive: { color: colors.primaryHover, fontWeight: '600' },

  /* --------------------------- Listas y tablas ---------------------------- */
  list: { gap: spacing.md },
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  listItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  listItemCodes: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  codeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  codeBadgeText: { ...typography.micro, color: colors.neutral },
  listItemTitle: { ...typography.bodyBold, color: colors.text, flexShrink: 1 },
  listItemAmount: { ...typography.subtitle, color: colors.text, textAlign: 'right' },
  listItemMeta: { ...typography.small, color: colors.textSecondary },
  listItemNotes: { ...typography.small, color: colors.textMuted, fontStyle: 'italic' },
  listItemActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },

  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableScroll: { flexGrow: 0 },
  tableContent: { paddingRight: spacing.lg },
  tableWrapper: { minWidth: '100%' },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tableHeaderText: { ...typography.smallBold, color: colors.textSecondary },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tableRowAlt: { backgroundColor: colors.surfaceAlt },
  tableRowLast: { borderBottomWidth: 0 },
  tableCell: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  tableCellFixed: { flexGrow: 0, flexShrink: 0 },
  alignRight: { alignItems: 'flex-end' },
  tableCellText: { ...typography.small, color: colors.text },
  tableCellSecondary: { ...typography.small, color: colors.textSecondary },
  tableCellStrong: { ...typography.smallBold, color: colors.text },
  colCode: { width: 62 },
  colDate: { width: 96 },
  colAmount: { width: 112 },
  colPercent: { width: 88 },
  colSmall: { width: 76 },
  colMedium: { width: 120 },
  colWide: { width: 168 },
  colXWide: { width: 230 },
  colFlexible: { flexGrow: 1, flexShrink: 1, minWidth: 130 },

  /* -------------------------- Gráficos y progreso ------------------------- */
  chart: { gap: spacing.md },
  chartRow: { gap: spacing.xs },
  chartRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  chartLabel: { ...typography.small, color: colors.textSecondary, flexShrink: 1 },
  chartValue: { ...typography.smallBold, color: colors.text },
  chartTrack: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
    overflow: 'hidden',
  },
  chartTrackThin: { height: 8 },
  chartFill: { height: '100%', borderRadius: radius.pill },
  chartGroupTrack: { height: 10, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chartLegendSwatch: { width: 12, height: 12, borderRadius: 3 },
  chartLegendLabel: { ...typography.small, color: colors.textSecondary },

  progressBar: { height: 8, borderRadius: radius.pill, backgroundColor: colors.neutralSoft, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  usageBox: { gap: spacing.xs },
  usageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  usageDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  usagePercent: { ...typography.smallBold, color: colors.textSecondary },

  /* ------------------------------- Badges --------------------------------- */
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  badgeText: { ...typography.micro },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },

  /* --------------------------- Estados de UI ------------------------------ */
  loadingBox: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  loadingText: { ...typography.small, color: colors.textMuted },
  emptyBox: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  emptyTitle: { ...typography.subtitle, color: colors.text },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center', maxWidth: 420 },
  errorBox: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorTitle: { ...typography.bodyBold, color: colors.danger },
  errorText: { ...typography.small, color: colors.danger },
  noticeBox: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.info,
  },
  noticeTitle: { ...typography.bodyBold, color: colors.info },
  noticeText: { ...typography.small, color: colors.textSecondary },
  privacyBanner: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  privacyBannerTitle: { ...typography.bodyBold, color: colors.text },
  privacyBannerText: { ...typography.small, color: colors.text, flexShrink: 1 },
  privacyBannerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  confirmBody: { gap: spacing.lg },
  confirmMessage: { ...typography.body, color: colors.textSecondary },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  recommendationList: { gap: spacing.sm },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  recommendationText: { ...typography.small, color: colors.text, flexShrink: 1 },

  topExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topExpenseRowLast: { borderBottomWidth: 0 },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  rankText: { ...typography.smallBold, color: colors.primaryHover },
  topExpenseInfo: { flex: 1, minWidth: 0, gap: 2 },
  topExpenseAmount: { ...typography.bodyBold, color: colors.text },

  /* ------------------------------ Filtros --------------------------------- */
  filterBar: { gap: spacing.sm },
  searchWrap: { flex: 1, minWidth: 200, position: 'relative' },
  searchInput: {
    minHeight: layout.minHitTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.small, color: colors.textSecondary },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },

  /* --------------------------- Texto legal / prosa ------------------------ */
  prose: { gap: spacing.md, maxWidth: 760 },
  proseTitle: { ...typography.title, color: colors.text },
  proseHeading: { ...typography.subtitle, color: colors.text, marginTop: spacing.sm },
  proseText: { ...typography.body, color: colors.textSecondary },
  proseBullet: { ...typography.body, color: colors.textSecondary, paddingLeft: spacing.lg },
  proseMeta: { ...typography.small, color: colors.textMuted },

  aboutList: { gap: spacing.sm },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  aboutLabel: { ...typography.small, color: colors.textMuted },
  aboutValue: { ...typography.smallBold, color: colors.text, textAlign: 'right', flexShrink: 1 },

  previewBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  previewText: { ...typography.small, color: colors.textSecondary },
});

/* -------------------------------------------------------------------------- */
/* 3. Fábricas de estilos (valores dinámicos)                                  */
/* -------------------------------------------------------------------------- */

const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

/** Ancho de barra horizontal (gráfico, progreso, uso de ingreso). */
export const barWidth = (percent: number): DimensionValue =>
  `${clampPercent(percent)}%`;

/** Barra de progreso/gráfico con color dinámico. */
export const barFillStyle = (percent: number, color: string): ViewStyle => ({
  width: barWidth(percent),
  backgroundColor: color,
});

/** Punto de la gráfica de uso de un ingreso (● activo / ○ inactivo). */
export const dotStyle = (active: boolean, color: string): ViewStyle => ({
  backgroundColor: active ? color : colors.neutralSoft,
});

/** Muestra de color de la leyenda de un gráfico. */
export const swatchStyle = (color: string): ViewStyle => ({
  backgroundColor: color,
});

/** Contenedor y texto de un badge según su estado. */
export const badgeStyle = (tone: Tone): { container: StyleProp<ViewStyle>; text: StyleProp<TextStyle> } => ({
  container: [styles.badge, { backgroundColor: tones[tone].background, borderColor: tones[tone].foreground }],
  text: [styles.badgeText, { color: tones[tone].foreground }],
});

/** Color de estado asociado a una tasa de ahorro (semáforo del dashboard). */
export const toneForSavingsRate = (rate: number): Tone => {
  if (rate >= 0.2) return 'success';
  if (rate >= 0.1) return 'warning';
  if (rate >= 0) return 'info';
  return 'danger';
};

/** Tono de un indicador numérico: negativo = peligro, positivo = éxito. */
export const toneForAmount = (amount: number): Tone =>
  amount >= 0 ? 'success' : 'danger';

/** Color de texto según el estado (para celdas y montos con signo). */
export const textToneStyle = (tone: Tone): TextStyle => ({ color: tones[tone].foreground });
