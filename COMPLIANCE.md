# Cumplimiento normativo — Control Financiero Familiar

Este documento resume las obligaciones legales y de accesibilidad consideradas en el proyecto,
las medidas ya implementadas y los pasos que **deben** completarse antes de publicar la
aplicación. No constituye asesoramiento jurídico: para una distribución comercial conviene
validarlo con un profesional del derecho del país de destino.

---

## 1. Alcance y rol de las partes

- La aplicación es de **uso personal/doméstico**: la persona usuaria introduce sus propios
  datos financieros y es responsable de ellos.
- No hay cuentas, ni perfiles, ni cesión de datos a terceros con fines comerciales.
- El proveedor de infraestructura es **Google LLC** (Firebase/Google Cloud), contratado
  directamente por la persona usuaria con su propio proyecto.

## 2. Normativa considerada

| Norma | Ámbito | Cómo aplica aquí |
| ----- | ------ | ---------------- |
| **RGPD** (UE 2016/679) | Datos personales en la UE/EEE | Aviso de privacidad (art. 13), base jurídica = consentimiento (art. 6.1.a), derechos de acceso/rectificación/supresión (arts. 15–17), portabilidad (art. 20), consentimiento granular y revocable (art. 7), minimización (art. 5.1.c). |
| **CCPA/CPRA** (California) | Consumidores de California | «No vendemos ni compartimos datos personales», derecho a eliminar y a obtener una copia (exportación JSON/CSV), sin discriminación por ejercer derechos. |
| **LGPD** (Brasil, Lei 13.709) | Datos en Brasil | Finalidad, transparencia, seguridad, derechos del titular (arts. 9, 18) y base por consentimiento (art. 7º, I). |
| **LFPDPPP** (México, Ley Federal de Protección de Datos Personales en Posesión de los Particulares) | Datos en México | Aviso de privacidad simplificado/complete, consentimiento expreso para datos sensibles (no aplica: no hay datos sensibles por categorización) y finalidad. |
| **COPPA / reglas de menores** | Menores de 13 años (EE. UU.) | La app no está dirigida a menores y no recopila sus datos (sección 9 del aviso). |
| **ePrivacy / cookies** | UE | No se usan cookies ni tecnologías de rastreo; por eso no hay banner de cookies. |
| **Ley de accesibilidad (EAA / Section 508 / ADA Title III)** | Producto digital | Ver sección 4. |
| **Directiva 2011/83/UE y normativa de consumidores** | Compras digitales | Aviso de responsabilidad visible: los cálculos son orientativos, no asesoramiento financiero. |
| **Licencias de código abierto** | Dependencias | Se entrega `LICENSE` (MIT) del proyecto y se respetan las licencias de Expo, React Native y Firebase (ver sección 5). |

## 3. Medidas de protección de datos ya implementadas

1. **Minimización**: solo se piden los campos estrictamente necesarios; todo texto tiene longitud
   máxima (`MAX_LENGTH`) y se limpia antes de guardarse.
2. **Sin identificadores**: no se capturan nombre, correo, teléfono, ubicación, contactos ni
   identificadores publicitarios.
3. **Sin analítica ni publicidad**: cero SDK de terceros de medición, cero cookies.
4. **Aviso de privacidad** versionado (`v1.0`) y consentimiento explícito registrado en Firestore
   (`settings.app.privacyConsent`), revocable en cualquier momento.
5. **Portabilidad**: exportación completa en JSON y por colección en CSV (UTF-8 con BOM para Excel).
6. **Supresión**: borrado individual por registro y borrado total desde Ajustes, con confirmación.
7. **Transparencia**: el texto legal está en la app y en `PRIVACY_POLICY.md`.
8. **Cifrado en tránsito**: Firestore usa TLS por defecto.
9. **Credenciales fuera del código**: variables de entorno `.env` (ignoradas por git); `.env.example`
   documenta cada variable.
10. **Registro de decisiones**: este archivo y el README documentan el diseño y sus límites.

## 4. Accesibilidad (WCAG 2.1 nivel AA y Ley 11/2007 / EAA)

- Contraste mínimo 4,5:1 en texto normal y 3:1 en controles (paleta verificada en `styles.ts`).
- Áreas táctiles de al menos 44×44 px y espaciado suficiente entre objetivos.
- Navegación completa por teclado en web (los `Pressable` exponen `focusable` y foco visible).
- Etiquetas de accesibilidad (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`)
  en botones, campos, tablas, gráficas y modales.
- La información **nunca** se comunica solo con color: siempre acompaña texto o icono
  (semáforos con texto, badges con etiqueta, gráficas con valores).
- Diseño responsivo: barra lateral en pantallas ≥1024 px, barra de pestañas inferior en
  pantallas angostas, tablas con desplazamiento horizontal.
- Se respeta el ajuste de texto del sistema; el contenido es operable y comprensible.

## 5. Licencias de dependencias

- Proyecto: **MIT** (`LICENSE`).
- Expo, React Native, React, React Navigation: MIT.
- Firebase JS SDK: Apache-2.0.
- `@expo/vector-icons`: MIT (iconografía Material Community Fonts bajo SIL OFL 1.1).
- No se incluyen imágenes, tipografías ni activos de terceros con licencia restrictiva.

## 6. Riesgos abiertos y acciones obligatorias antes de publicar

| # | Riesgo | Acción recomendada | Responsable |
| - | ------ | ------------------ | ----------- |
| 1 | `firestore.rules` permite lectura/escritura a cualquiera (por la ausencia de autenticación exigida por el proyecto). | Activar **Firebase App Check** (consola → App Check → Enforce) o añadir autenticación anónima y cambiar las reglas a `if request.auth != null`. | Quien publique |
| 2 | Sin límite de gasto en la base de datos (posible abuso del servicio). | Aplicar cuotas de uso y presupuesto de alertas en Google Cloud; revisar Cloud Audit Logs. | Quien publique |
| 3 | Sin cifrado adicional en reposo configurable desde la app. | Activar cifrado en reposo de Firestore (por defecto en Google Cloud) y restringir accesos a la consola con MFA + permisos mínimos. | Quien publique |
| 4 | No hay copia de seguridad automatizada. | Programar exportaciones periódicas (gcloud firestore export) o activar backups de Firestore. | Quien publique |
| 5 | El aviso de privacidad menciona un correo de contacto que debe rellenarse. | Completar el contacto del responsable antes de distribuir. | Autor del repositorio |
| 6 | Sin pruebas automatizadas ni CI. | Añadir pruebas unitarias de `utils/calculations.ts` y un pipeline con `typecheck` + `doctor`. | Desarrollo |

## 7. Lista de verificación previa a distribución

- [ ] `.env` con credenciales reales y `firestore.rules` publicado.
- [ ] App Check activo y con «Enforce» (o autenticación añadida).
- [ ] Aviso de privacidad revisado, con correo de contacto válido.
- [ ] Pruebas manuales en Android físico y en navegador (móvil y escritorio).
- [ ] `npm run typecheck` y `npm run doctor` sin errores.
- [ ] `npm run build:web` exporta correctamente si se publicará la versión web.
- [ ] Exportación de prueba (JSON y CSV) y borrado total verificados.
