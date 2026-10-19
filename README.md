# Control Financiero Familiar

Aplicación multiplataforma (Android, iOS y Web) para administrar las finanzas de un hogar.
Fue construida a partir del archivo `Control Financiero Familiar (2).xlsx`: cada hoja y fórmula
de ese archivo está implementada como funcionalidad de la aplicación.

- **Stack**: Expo (React Native) + Expo Router + TypeScript estricto + Firebase Firestore.
- **Sin autenticación** (requisito explícito del proyecto) y **sin rastreadores, cookies ni analítica**.
- **Un solo archivo de estilos** para todo el proyecto: `src/styles/styles.ts`.

---

## 1. Funcionalidades (equivalencia con la hoja de cálculo)

| Hoja del archivo original | Funcionalidad implementada |
| ------------------------- | -------------------------- |
| `Categorias` | Pantalla **Categorías**: crear, editar, eliminar y restablecer las categorías base (7 de ingreso y 16 de gasto). |
| `Ingresos` | Pantalla **Ingresos**: código `I-001`, fecha, descripción, categoría, monto, periodicidad y notas. Incluye la columna «Grafica Uso» como indicador de 10 puntos (●/○). |
| `Gastos` | Pantalla **Gastos**: código `G-001`, fecha, descripción, categoría, ingreso asociado, monto, quincena y notas, con reparto por quincena. |
| `Presupuesto` | Pantalla **Presupuesto**: monto sugerido y periodicidad por categoría, diferencia (sugerido − real), estado, % usado, % del ingreso y gráfica de uso de 10 puntos. |
| `Dashboard` | Pantalla **Inicio**: ingresos mensuales/anuales, gastos mensuales/anuales, balance, tasa de ahorro, gasto diario, semáforo, gasto por categoría, gasto por periodicidad (real vs. presupuestado), top 5 gastos y recomendaciones automáticas. |
| `Form Responses 1` | Sin datos en el archivo original; no se implementa. |

### Fórmulas replicadas (`src/utils/calculations.ts`)

- Ingreso mensual = Σ (monto × factor de periodicidad):
  `Diario 30`, `Semanal 4.33`, `Quincenal 2`, `Mensual 1`, `BiMensual 0.5`,
  `Trimestral 1/3`, `Cuatrimestral 0.25`, `Semestral 1/6`, `Anual 1/12`.
- Gastos mensuales = Σ de los gastos registrados (sin normalizar, igual que la hoja).
- Balance = ingresos − gastos · Tasa de ahorro = balance / ingresos · Gasto diario = balance / 30.
- Semáforo: ≥20% excelente · 10–20% aceptable · 0–10% ajustar · <0 déficit.
- Recomendaciones: 5 reglas de la hoja original (ahorro alto, medio, bajo, déficit y gasto >80%).

---

## 2. Requisitos

- Node.js 20 o superior y npm.
- (Opcional) Una cuenta de Google con un proyecto de Firebase para guardar datos.

> **Red**: este entorno tiene el registro oficial de npm bloqueado; el registro se configuró a
> `https://registry.npmmirror.com` con `npm config set registry https://registry.npmmirror.com`.
> Si tus instalaciones fallan, revisa `npm config get registry`.

---

## 3. Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase
copy .env.example .env      # en macOS/Linux: cp .env.example .env
# Edita .env y pega las credenciales de tu proyecto de Firebase
# (consola → Configuración del proyecto → Tus apps → SDK de Firebase).

# 3. Publicar las reglas de Firestore
#    Consola de Firebase → Firestore Database → Reglas → pega el contenido
#    de firestore.rules → Publicar.

# 4. Arrancar
npm run web       # navegador (responsivo)
npm run android   # Expo Go en Android (escanea el QR)
npm run start     # servidor de desarrollo
```

Sin credenciales la aplicación arranca igualmente y muestra una pantalla con instrucciones;
no se rompe ni deja de compilar.

### Scripts disponibles

| Script | Descripción |
| ------ | ----------- |
| `npm run start` | Servidor de desarrollo de Expo. |
| `npm run web` | Arranque directo en navegador. |
| `npm run android` | Arranque en dispositivo/emulador Android (Expo Go). |
| `npm run build:web` | Exporta la versión web estática a `dist/`. |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`). |
| `npm run lint` | Análisis estático con ESLint (`expo lint`). |
| `npm run doctor` | Diagnóstico de dependencias y configuración de Expo. |

---

## 4. Estructura del proyecto

```
src/
├── app/                # Rutas de Expo Router (una pantalla por archivo)
│   ├── _layout.tsx     # Proveedores globales + AppShell + Stack
│   ├── index.tsx       # Inicio (dashboard)
│   ├── ingresos.tsx    # Ingresos
│   ├── gastos.tsx      # Gastos
│   ├── presupuesto.tsx # Presupuesto
│   ├── categorias.tsx  # Categorías
│   ├── ajustes.tsx     # Ajustes (moneda, exportación, borrado, privacidad)
│   └── privacidad.tsx  # Aviso de privacidad completo
├── components/         # Componentes reutilizables (botones, tablas, modales…)
│   └── forms/          # Formularios modales de cada entidad
├── context/            # AppContext: estado global, suscripciones y acciones
├── services/           # CRUD sobre Firestore + validación
├── hooks/              # useResponsive, useAsyncAction
├── utils/              # Cálculos, dinero, fechas, validación, exportación
├── constants/          # Catálogos y textos legales
├── config/             # Inicialización de Firebase (por variables de entorno)
├── types/              # Tipos de dominio
└── styles/styles.ts    # ÚNICO archivo de estilos del proyecto
```

### Datos en Firestore

| Colección      | Documento                       | Contenido |
| -------------- | ------------------------------- | --------- |
| `categories`   | id automático                   | tipo (ingreso/gasto), nombre, descripción |
| `incomes`      | id automático                   | código, fecha, descripción, categoría, monto, periodicidad, notas |
| `expenses`     | id automático                   | código, fecha, categoría, ingreso asociado, monto, quincena, notas |
| `budgets`      | **id = id de la categoría**     | monto sugerido, periodicidad |
| `settings`     | `app`                           | moneda y consentimiento del aviso de privacidad |

Las fechas se guardan como texto `YYYY-MM-DD`; los datos se ordenan en la aplicación para no
necesitar índices compuestos en Firestore.

---

## 5. Accesibilidad y diseño

- Contraste mínimo 4.5:1, áreas táctiles ≥44 px, foco visible (WCAG 2.1 AA).
- Navegación lateral en pantallas ≥1024 px y barra de pestañas inferior en pantallas angostas.
- Toda la información se comunica con texto además de color (nunca solo color).
- Modales propios en lugar de `Alert.alert`, que no existe en web.

## 6. Documentación legal

- `PRIVACY_POLICY.md` — aviso de privacidad (mismo texto que muestra la aplicación).
- `COMPLIANCE.md` — obligaciones legales, análisis de riesgos y pasos antes de publicar.
- `LICENSE` — licencia MIT.

## 7. Limitaciones conocidas

- No hay autenticación ni sincronización entre usuarios: es una app de uso doméstico
  (requisito del proyecto).
- No hay pruebas automatizadas ni integración continua configuradas.
- Las categorías base se siembran solo la primera vez que Firestore está vacío.
