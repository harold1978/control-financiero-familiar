import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { styles } from '../styles/styles';
import { PRIVACY_POLICY_VERSION } from '../constants/app';

/**
 * Banner de consentimiento de privacidad (art. 13 RGPD / art. 16 LFPDPPP).
 * Se muestra hasta que la persona acepta la versión vigente del aviso.
 */
export function PrivacyBanner({
  onAccept,
  onRead,
  onReject,
  loading,
}: {
  onAccept: () => void;
  onRead: () => void;
  onReject: () => void;
  loading?: boolean;
}): React.ReactElement {
  return (
    <View style={styles.privacyBanner} accessibilityRole="alert">
      <Text style={styles.privacyBannerTitle}>Aviso de privacidad</Text>
      <Text style={styles.privacyBannerText}>
        Esta aplicación guarda los datos financieros de tu familia en Google Firestore. No usa
        publicidad, cookies ni rastreadores. Versión {PRIVACY_POLICY_VERSION}.
      </Text>
      <View style={styles.privacyBannerActions}>
        <Button label="Leer aviso" variant="secondary" size="small" onPress={onRead} />
        <Button label="Rechazar" variant="ghost" size="small" onPress={onReject} />
        <Button label="Aceptar" variant="primary" size="small" onPress={onAccept} loading={loading} />
      </View>
    </View>
  );
}
