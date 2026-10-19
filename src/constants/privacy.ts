/**
 * Texto del aviso de privacidad mostrado dentro de la aplicación.
 *
 * Contenido redactado según el Reglamento General de Protección de Datos (RGPD,
 * UE 2016/679), la ley de privacidad del consumidor de California (CCPA/CPRA)
 * y la Ley General de Protección de Datos Personales de Brasil (LGPD).
 *
 * El mismo texto se publica en PRIVACY_POLICY.md; si se modifica uno hay que
 * modificar el otro y aumentar PRIVACY_POLICY_VERSION para volver a pedir
 * el consentimiento.
 */

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/** Fecha de última actualización del texto legal. */
export const POLICY_UPDATED_AT = '19 de octubre de 2026';

/** Aviso de responsabilidad mostrado también en "Ajustes". */
export const DISCLAIMER =
  'Esta aplicación es una herramienta de organización doméstica. Los cálculos que ' +
  'muestra (balance, ahorro, proyecciones) son orientativos y no constituyen ' +
  'asesoramiento financiero, fiscal, contable ni de inversión. Los datos que se ' +
  'registran son de responsabilidad de quien los introduce.';

export const POLICY_SECTIONS: PolicySection[] = [
  {
    heading: '1. Responsable del tratamiento',
    paragraphs: [
      'El Control Financiero Familiar es una aplicación de uso personal que instalas ' +
        'y ejecutas en tus propios dispositivos, y que se conecta a tu propio proyecto ' +
        'de Google Firebase. Quien decide sobre los datos eres tú (la persona usuaria).',
      'Para cuestiones relacionadas con esta política escribe al correo del responsable ' +
        'indicado en el repositorio del proyecto.',
    ],
  },
  {
    heading: '2. Datos que se tratan',
    paragraphs: [
      'La aplicación solo guarda la información que decides registrar manualmente:',
    ],
    bullets: [
      'Categorías de ingresos y gastos (nombre y descripción).',
      'Ingresos: fecha, descripción, categoría, monto, periodicidad y notas.',
      'Gastos: fecha, descripción, categoría, ingreso asociado, monto, quincena y notas.',
      'Presupuestos: monto sugerido y periodicidad por categoría.',
      'Ajustes: moneda mostrada y constancia de aceptación de este aviso.',
    ],
  },
  {
    heading: '3. Datos que NO se recopilan',
    paragraphs: ['La aplicación no recopila, ni usa, ni cede a terceros:'],
    bullets: [
      'Nombre, correo electrónico, teléfono o cualquier dato de contacto.',
      'Ubicación, contactos, fotos, micrófono, cámara o lista de aplicaciones.',
      'Identificadores publicitarios, huella del dispositivo o datos de publicidad.',
      'Herramientas de analítica, mapas de calor, sesiones grabadas o SDK de terceros.',
      'Cookies de seguimiento o tecnologías de rastreo similares.',
      'Datos de menores de edad.',
    ],
  },
  {
    heading: '4. Finalidad y base jurídica',
    paragraphs: [
      'Los datos se tratan con la única finalidad de organizar y analizar las finanzas ' +
        'del hogar: calcular ingresos, gastos, balance, tasa de ahorro y cumplimiento ' +
        'del presupuesto. La base jurídica es tu consentimiento, que otorgas al aceptar ' +
        'este aviso (art. 6.1.a del RGPD), y el interés legítimo en mantener el ' +
        'funcionamiento técnico de la aplicación. Puedes retirar el consentimiento en ' +
        'cualquier momento desde Ajustes sin que ello afecte a la licitud del tratamiento previo.',
    ],
  },
  {
    heading: '5. Dónde se guardan los datos',
    paragraphs: [
      'Los datos se almacenan en Google Cloud Firestore dentro del proyecto de Firebase ' +
        'que tú hayas configurado, cifrados en tránsito mediante TLS. Esta aplicación no ' +
        'usa autenticación de usuarios por decisión de diseño, por lo que cualquier persona ' +
        'con acceso al proyecto de Firebase podría leer o modificar la información: protege ' +
        'el acceso al proyecto de Google Cloud con un presupuesto de permisos mínimo y, si ' +
        'la aplicación se publica, activa Firebase App Check.',
      'La aplicación no guarda copias en tu dispositivo, no usa cookies ni almacenamiento ' +
        'local con fines de seguimiento.',
    ],
  },
  {
    heading: '6. Plazo de conservación',
    paragraphs: [
      'Los datos se conservan mientras existan en tu proyecto de Firebase. Puedes eliminar ' +
        'registros individuales o borrar el conjunto completo desde Ajustes → «Borrar todos ' +
        'los datos» (derecho de supresión, art. 17 del RGPD). El borrado es definitivo y no ' +
        'se mantiene ninguna copia en la aplicación.',
    ],
  },
  {
    heading: '7. Destinatarios y transferencias internacionales',
    paragraphs: [
      'No se ceden datos a empresas de publicidad ni a terceros con fines comerciales. El ' +
        'único proveedor de infraestructura es Google LLC, que actúa como encargado del ' +
        'tratamiento bajo sus condiciones de servicio y las cláusulas contractuales tipo de ' +
        'la Comisión Europea. La legislación aplicable a cada usuario es la de su país de residencia.',
    ],
  },
  {
    heading: '8. Tus derechos',
    paragraphs: ['Puedes ejercer en cualquier momento los derechos de acceso, rectificación, ' +
      'supresión, oposición, limitación y portabilidad. La aplicación pone a tu disposición:'],
    bullets: [
      'Exportar todos los datos en JSON y en CSV desde Ajustes (portabilidad).',
      'Borrar todos los datos desde Ajustes (supresión).',
      'Retirar el consentimiento de este aviso desde Ajustes.',
      'Consultar el contenido de este aviso en cualquier momento en la pantalla Privacidad.',
    ],
  },
  {
    heading: '9. Personas menores de edad',
    paragraphs: [
      'La aplicación está dirigida a personas adultas que administran el hogar. No está ' +
        'destinada a menores de 13 años (o de 16 años en la Unión Europea) y no se recopilan ' +
        'deliberadamente sus datos. Si detectas que se han registrado datos de un menor, ' +
        'elimínalos desde la aplicación.',
    ],
  },
  {
    heading: '10. Cambios en este aviso',
    paragraphs: [
      `Última actualización: ${POLICY_UPDATED_AT}. Si el contenido cambia de forma ` +
        'sustancial, la aplicación volverá a mostrar este aviso para que puedas aceptarlo de nuevo.',
    ],
  },
];
