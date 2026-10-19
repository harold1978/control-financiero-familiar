/**
 * Pantalla "Ingresos": alta, edición, borrado y control de uso de cada ingreso.
 * Reproduce la hoja "Ingresos" (código, fecha, descripción, categoría, monto,
 * periodicidad) y la columna "Grafica Uso" con la gráfica de 10 puntos.
 */
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { UsageIndicator } from '../components/UsageIndicator';
import { IncomeForm } from '../components/forms/IncomeForm';
import { useApp } from '../context/AppContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { PERIODICITIES } from '../constants/app';
import { colors, styles } from '../styles/styles';
import type { Income } from '../types';
import { formatShortDate } from '../utils/dates';
import { formatMoney } from '../utils/money';
import {
  getIncomeUsage,
  getIncomeUsageRatio,
  sumMonthlyIncome,
} from '../utils/calculations';

export default function IncomesScreen() {
  const app = useApp();
  const deleteAction = useAsyncAction();
  const format = (value: number) => formatMoney(value, app.currency);

  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('Todas');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Income | null>(null);

  const usedPeriodicities = useMemo(
    () => PERIODICITIES.filter((period) => app.incomes.some((income) => income.periodicity === period)),
    [app.incomes],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return app.incomes.filter((income) => {
      if (periodFilter !== 'Todas' && income.periodicity !== periodFilter) return false;
      if (!query) return true;
      const categoryName = app.categoryNames.get(income.categoryId) ?? '';
      return `${income.code} ${income.description} ${categoryName} ${income.notes}`
        .toLocaleLowerCase('es')
        .includes(query);
    });
  }, [app.incomes, app.categoryNames, search, periodFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (income: Income) => {
    setEditing(income);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const success = await deleteAction.run(() => app.deleteIncome(pendingDelete.id));
    if (success) setPendingDelete(null);
  };

  const monthlyTotal = sumMonthlyIncome(app.incomes);

  return (
    <Screen>
      <PageHeader
        title="Ingresos"
        description="Cada ingreso se normaliza a valor mensual según su periodicidad para el balance del tablero."
        action={
          <Button label="Nuevo ingreso" icon="plus" onPress={openCreate} disabled={!app.configured} />
        }
      />

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total mensual normalizado</Text>
          <Text style={styles.summaryValue}>{format(monthlyTotal)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ingresos registrados</Text>
          <Text style={styles.summaryValue}>{app.incomes.length}</Text>
        </View>
      </View>

      {app.loading ? (
        <LoadingState message="Cargando ingresos…" />
      ) : (
        <>
          {/* Búsqueda y filtro por periodicidad */}
          <View style={styles.filterBar}>
            <View style={styles.searchWrap}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por código, descripción o categoría…"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Buscar ingresos"
                style={styles.searchInput}
              />
            </View>
            <View style={styles.chipRow}>
              {['Todas', ...usedPeriodicities].map((period) => {
                const active = periodFilter === period;
                return (
                  <Button
                    key={period}
                    label={period}
                    variant={active ? 'primary' : 'secondary'}
                    size="small"
                    onPress={() => setPeriodFilter(period)}
                    accessibilityLabel={`Filtrar por periodicidad ${period}`}
                  />
                );
              })}
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState
              icon="cash-multiple"
              title={app.incomes.length === 0 ? 'Sin ingresos registrados' : 'Sin resultados'}
              description={
                app.incomes.length === 0
                  ? 'Registra tus fuentes de ingreso (salario, arriendo, freelance…) para calcular el balance.'
                  : 'Prueba con otra búsqueda o quita los filtros.'
              }
              action={
                app.incomes.length === 0 ? (
                  <Button label="Nuevo ingreso" icon="plus" onPress={openCreate} />
                ) : undefined
              }
            />
          ) : (
            <View style={styles.list}>
              {filtered.map((income) => {
                const used = getIncomeUsage(income, app.expenses);
                const ratio = getIncomeUsageRatio(income, app.expenses);

                return (
                  <View key={income.id} style={styles.listItem}>
                    <View style={styles.listItemTop}>
                      <View style={styles.grow}>
                        <View style={styles.listItemCodes}>
                          <View style={styles.codeBadge}>
                            <Text style={styles.codeBadgeText}>{income.code}</Text>
                          </View>
                          <Text style={styles.listItemTitle} numberOfLines={2}>
                            {income.description}
                          </Text>
                        </View>
                        <Text style={styles.listItemMeta}>
                          {app.categoryNames.get(income.categoryId) ?? 'Sin categoría'} ·{' '}
                          {formatShortDate(income.date)}
                        </Text>
                        <View style={styles.badgeRow}>
                          <Badge label={income.periodicity} tone="info" />
                        </View>
                        {income.notes ? (
                          <Text style={styles.listItemNotes} numberOfLines={3}>
                            {income.notes}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.listItemAmount}>{format(income.amount)}</Text>
                    </View>

                    <UsageIndicator
                      used={used}
                      total={income.amount}
                      ratio={ratio}
                      format={format}
                    />

                    <View style={styles.listItemActions}>
                      <Button
                        label="Eliminar"
                        variant="danger"
                        size="small"
                        icon="trash-can-outline"
                        onPress={() => setPendingDelete(income)}
                        accessibilityLabel={`Eliminar ingreso ${income.code}`}
                      />
                      <Button
                        label="Editar"
                        variant="secondary"
                        size="small"
                        icon="pencil-outline"
                        onPress={() => openEdit(income)}
                        accessibilityLabel={`Editar ingreso ${income.code}`}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={styles.footnote}>
            Uso del ingreso: proporción del monto que ya fue destinado a gastos asociados. La
            gráfica de 10 puntos marca con ● la parte utilizada y con ○ la disponible.
          </Text>
        </>
      )}

      {formVisible ? (
        <IncomeForm
          visible
          income={editing}
          categories={app.categories}
          onClose={() => setFormVisible(false)}
          onSubmit={(draft) => (editing ? app.editIncome(editing, draft) : app.addIncome(draft))}
        />
      ) : null}

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Eliminar ingreso"
        message={
          pendingDelete
            ? `Se eliminará el ingreso ${pendingDelete.code} (${pendingDelete.description}) de forma definitiva. Los gastos asociados conservarán su registro pero dejarán de contar para el uso de este ingreso.`
            : ''
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteAction.busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {deleteAction.error ? (
        <Card title="No se pudo eliminar">
          <Text style={styles.errorText}>{deleteAction.error}</Text>
          <Button label="Cerrar" variant="secondary" size="small" onPress={deleteAction.clearError} />
        </Card>
      ) : null}
    </Screen>
  );
}
