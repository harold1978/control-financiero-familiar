/**
 * Pantalla "Ajustes": moneda, exportación de datos, borrado total,
 * privacidad y datos de la aplicación.
 *
 * La exportación y el borrado responden a los derechos de portabilidad y
 * supresión (RGPD arts. 20 y 17).
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NoticeBox } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { SelectField } from '../components/Fields';
import { useApp } from '../context/AppContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { APP_VERSION, CURRENCIES, PRIVACY_POLICY_VERSION } from '../constants/app';
import { DISCLAIMER, POLICY_UPDATED_AT } from '../constants/privacy';
import { styles } from '../styles/styles';
import { buildFileTimestamp } from '../utils/dates';
import {
  buildCsv,
  buildFileName,
  copyText,
  deliverFile,
  toJson,
  type ExportKind,
} from '../utils/exportData';

const CSV_OPTIONS: { kind: ExportKind; label: string }[] = [
  { kind: 'incomes', label: 'CSV de ingresos' },
  { kind: 'expenses', label: 'CSV de gastos' },
  { kind: 'budgets', label: 'CSV de presupuestos' },
  { kind: 'categories', label: 'CSV de categorías' },
];

export default function SettingsScreen() {
  const app = useApp();
  const exportAction = useAsyncAction();
  const deleteAction = useAsyncAction();
  const consentAction = useAsyncAction();
  const currencyAction = useAsyncAction();

  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const data = {
    categories: app.categories,
    incomes: app.incomes,
    expenses: app.expenses,
    budgets: app.budgets,
  };

  /** Ejecuta una entrega de archivo y muestra el resultado. */
  const deliver = (operation: () => Promise<{ ok: boolean; message: string }>) =>
    exportAction.run(async () => {
      const result = await operation();
      if (!result.ok) throw new Error(result.message);
      setNotice(result.message);
    });

  const exportJson = () =>
    deliver(() =>
      deliverFile(
        `control-financiero-datos-${buildFileTimestamp()}.json`,
        toJson(data),
        'application/json',
      ),
    );

  const exportCsv = (kind: ExportKind) =>
    deliver(() => deliverFile(buildFileName(kind, 'csv'), buildCsv(kind, data), 'text/csv'));

  const copyJson = () =>
    deliver(async () => {
      const result = await copyText(toJson(data));
      return result;
    });

  const deleteEverything = async () => {
    const success = await deleteAction.run(async () => {
      await app.deleteAllData();
      setNotice('Se eliminaron todos los datos de la aplicación.');
    });
    if (success) setConfirmDeleteAll(false);
  };

  const changeConsent = (accept: boolean) =>
    consentAction.run(async () => {
      if (accept) await app.acceptPrivacy();
      else await app.revokePrivacy();
      setNotice(
        accept
          ? 'Aceptaste el aviso de privacidad vigente.'
          : 'Retiraste tu consentimiento: vuelve a leerlo para continuar.',
      );
    });

  return (
    <Screen>
      <PageHeader
        title="Ajustes"
        description="Moneda, copias de tus datos, privacidad y información de la aplicación."
      />

      {notice ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{notice}</Text>
        </View>
      ) : null}

      {exportAction.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{exportAction.error}</Text>
        </View>
      ) : null}

      {/* Moneda */}
      <Card title="Moneda">
        <SelectField
          label="Moneda mostrada"
          value={app.currency}
          options={CURRENCIES.map((item) => ({ value: item.code, label: item.label }))}
          onChange={(value) => {
            setNotice(null);
            currencyAction.run(async () => {
              await app.saveCurrency(value);
              setNotice(`Moneda cambiada a ${value}.`);
            });
          }}
          hint="El formato numérico sigue la configuración regional del dispositivo."
        />
        {currencyAction.error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{currencyAction.error}</Text>
          </View>
        ) : null}
      </Card>

      {/* Exportación de datos */}
      <Card title="Exportar mis datos">
        <Text style={styles.footnote}>
          Descarga toda tu información en un formato abierto (derecho de portabilidad). En Android
          se abre la hoja «Compartir» del sistema.
        </Text>
        <View style={styles.rowWrap}>
          <Button
            label="Descargar JSON completo"
            icon="code-json"
            loading={exportAction.busy}
            onPress={exportJson}
            disabled={!app.configured}
          />
          <Button
            label="Copiar JSON"
            icon="content-copy"
            variant="secondary"
            onPress={copyJson}
            disabled={!app.configured}
          />
          {CSV_OPTIONS.map((option) => (
            <Button
              key={option.kind}
              label={option.label}
              variant="secondary"
              size="small"
              icon="file-delimited"
              onPress={() => exportCsv(option.kind)}
              disabled={!app.configured}
            />
          ))}
        </View>
      </Card>

      {/* Privacidad */}
      <Card title="Privacidad">
        <Text style={styles.footnote}>
          Aviso de privacidad versión {PRIVACY_POLICY_VERSION} (actualizado el {POLICY_UPDATED_AT}).
          Consentimiento actual:{' '}
          <Text style={styles.textBold}>
            {app.settings.privacyConsent.accepted &&
            app.settings.privacyConsent.policyVersion === PRIVACY_POLICY_VERSION
              ? 'aceptado'
              : 'pendiente'}
          </Text>
          .
        </Text>
        <View style={styles.rowWrap}>
          <Button
            label="Leer aviso de privacidad"
            icon="shield-lock-outline"
            variant="secondary"
            onPress={() => router.push('/privacidad')}
          />
          <Button
            label={app.privacyPending ? 'Aceptar aviso' : 'Retirar consentimiento'}
            variant={app.privacyPending ? 'primary' : 'secondary'}
            size="small"
            loading={consentAction.busy}
            onPress={() => changeConsent(!app.privacyPending)}
          />
        </View>
      </Card>

      {/* Zona de borrado */}
      <Card title="Borrar todos los datos">
        <Text style={styles.footnote}>
          Elimina de forma definitiva ingresos, gastos, presupuestos, categorías y ajustes del
          proyecto de Firebase. Esta acción no se puede deshacer.
        </Text>
        <View style={styles.rowWrap}>
          <Button
            label="Borrar todos los datos"
            variant="danger"
            icon="trash-can-outline"
            onPress={() => setConfirmDeleteAll(true)}
            disabled={!app.configured}
          />
        </View>
        {deleteAction.error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{deleteAction.error}</Text>
          </View>
        ) : null}
      </Card>

      {/* Información */}
      <Card title="Acerca de esta aplicación">
        <View style={styles.aboutList}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Aplicación</Text>
            <Text style={styles.aboutValue}>Control Financiero Familiar</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Versión</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Estado de Firebase</Text>
            <View>
              <Badge
                label={app.configured ? 'Configurado' : 'Sin configurar'}
                tone={app.configured ? 'success' : 'warning'}
              />
            </View>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Registros</Text>
            <Text style={styles.aboutValue}>
              {app.categories.length} categorías · {app.incomes.length} ingresos ·{' '}
              {app.expenses.length} gastos · {app.budgets.length} presupuestos
            </Text>
          </View>
        </View>
        <NoticeBox title="Aviso de responsabilidad">{DISCLAIMER}</NoticeBox>
      </Card>

      <ConfirmDialog
        visible={confirmDeleteAll}
        title="Borrar todos los datos"
        message="Se eliminarán ingresos, gastos, presupuestos, categorías y ajustes de Firebase. No se puede deshacer. Te recomendamos exportar tus datos antes."
        confirmLabel="Borrar todo"
        destructive
        loading={deleteAction.busy}
        onConfirm={deleteEverything}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </Screen>
  );
}
