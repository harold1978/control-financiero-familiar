/**
 * Pantalla "Privacidad": muestra el texto completo del aviso de privacidad
 * y permite aceptarlo o retirar el consentimiento.
 */
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { PRIVACY_POLICY_VERSION } from '../constants/app';
import { DISCLAIMER, POLICY_SECTIONS, POLICY_UPDATED_AT } from '../constants/privacy';
import { styles } from '../styles/styles';

export default function PrivacyScreen() {
  const app = useApp();
  const consentAction = useAsyncAction();

  const accepted =
    app.settings.privacyConsent.accepted &&
    app.settings.privacyConsent.policyVersion === PRIVACY_POLICY_VERSION;

  const setConsent = (accept: boolean) =>
    consentAction.run(async () => {
      if (accept) await app.acceptPrivacy();
      else await app.revokePrivacy();
    });

  return (
    <Screen>
      <PageHeader
        title="Aviso de privacidad"
        description={`Versión ${PRIVACY_POLICY_VERSION} · actualizado el ${POLICY_UPDATED_AT}.`}
      />

      <View style={styles.rowWrap}>
        <Button
          label="Volver"
          variant="secondary"
          icon="arrow-left"
          onPress={() => router.back()}
        />
        <Button
          label={accepted ? 'Retirar consentimiento' : 'Aceptar el aviso'}
          variant={accepted ? 'secondary' : 'primary'}
          loading={consentAction.busy}
          onPress={() => setConsent(!accepted)}
        />
      </View>

      {consentAction.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{consentAction.error}</Text>
        </View>
      ) : null}

      <View style={styles.prose}>
        {POLICY_SECTIONS.map((section) => (
          <View key={section.heading} style={styles.prose}>
            <Text style={styles.proseHeading} accessibilityRole="header">
              {section.heading}
            </Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text key={index} style={styles.proseText}>
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet, index) => (
              <Text key={index} style={styles.proseBullet}>
                • {bullet}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.proseMeta}>
          Este mismo texto está publicado en el archivo PRIVACY_POLICY.md del repositorio.
        </Text>
      </View>

      <Card title="Responsabilidad">
        <Text style={styles.proseText}>{DISCLAIMER}</Text>
      </Card>
    </Screen>
  );
}
