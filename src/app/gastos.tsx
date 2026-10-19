/**
 * Pantalla "Gastos": alta, edición y borrado de gastos.
 * Reproduce la hoja "Gastos" (código, fecha, descripción, categoría, ingreso
 * asociado, monto, quincena) y agrupa por quincena como en el archivo base.
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
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { useApp } from '../context/AppContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { barFillStyle, colors, styles } from '../styles/styles';
import type { Expense } from '../types';
import { formatShortDate } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/money';
import { sumExpenses } from '../utils/calculations';

export default function ExpensesScreen() {
  const app = useApp();
  const deleteAction = useAsyncAction();
  const format = (value: number) => formatMoney(value, app.currency);

  const [search, setSearch] = useState('');
  const [fortnightFilter, setFortnightFilter] = useState<'Todas' | 'Primera' | 'Segunda'>('Todas');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return app.expenses.filter((expense) => {
      if (fortnightFilter !== 'Todas' && expense.fortnight !== fortnightFilter) return false;
      if (!query) return true;
      const categoryName = app.categoryNames.get(expense.categoryId) ?? '';
      return `${expense.code} ${expense.description} ${categoryName} ${expense.notes}`
        .toLocaleLowerCase('es')
        .includes(query);
    });
  }, [app.expenses, app.categoryNames, search, fortnightFilter]);

  const total = sumExpenses(app.expenses);
  const totalFirst = app.expenses
    .filter((expense) => expense.fortnight === 'Primera')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalSecond = total - totalFirst;

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const success = await deleteAction.run(() => app.deleteExpense(pendingDelete.id));
    if (success) setPendingDelete(null);
  };

  const incomeLabel = (expense: Expense) => {
    if (!expense.incomeId) return 'Sin ingreso asociado';
    const income = app.incomes.find((item) => item.id === expense.incomeId);
    return income ? `Usado de ${income.code}` : 'Ingreso eliminado';
  };

  return (
    <Screen>
      <PageHeader
        title="Gastos"
        description="Los gastos se suman tal como se registraron (sin normalizar por periodicidad) para el balance mensual."
        action={
          <Button label="Nuevo gasto" icon="plus" onPress={openCreate} disabled={!app.configured} />
        }
      />

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total de gastos</Text>
          <Text style={styles.summaryValue}>{format(total)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Primera quincena</Text>
          <Text style={styles.summaryValue}>{format(totalFirst)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Segunda quincena</Text>
          <Text style={styles.summaryValue}>{format(totalSecond)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Gastos registrados</Text>
          <Text style={styles.summaryValue}>{app.expenses.length}</Text>
        </View>
      </View>

      {app.loading ? (
        <LoadingState message="Cargando gastos…" />
      ) : (
        <>
          <View style={styles.filterBar}>
            <View style={styles.searchWrap}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por código, descripción o categoría…"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Buscar gastos"
                style={styles.searchInput}
              />
            </View>
            <View style={styles.chipRow}>
              {(['Todas', 'Primera', 'Segunda'] as const).map((fortnight) => {
                const active = fortnightFilter === fortnight;
                return (
                  <Button
                    key={fortnight}
                    label={fortnight === 'Todas' ? 'Todas las quincenas' : fortnight}
                    variant={active ? 'primary' : 'secondary'}
                    size="small"
                    onPress={() => setFortnightFilter(fortnight)}
                    accessibilityLabel={`Filtrar por quincena ${fortnight}`}
                  />
                );
              })}
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState
              icon="cash-minus"
              title={app.expenses.length === 0 ? 'Sin gastos registrados' : 'Sin resultados'}
              description={
                app.expenses.length === 0
                  ? 'Registra tus gastos (supermercado, servicios, transporte…) y asígnalos a un ingreso para controlar cuánto de él ya se usó.'
                  : 'Prueba con otra búsqueda o quita los filtros.'
              }
              action={
                app.expenses.length === 0 ? (
                  <Button label="Nuevo gasto" icon="plus" onPress={openCreate} />
                ) : undefined
              }
            />
          ) : (
            <View style={styles.list}>
              {filtered.map((expense) => (
                <View key={expense.id} style={styles.listItem}>
                  <View style={styles.listItemTop}>
                    <View style={styles.grow}>
                      <View style={styles.listItemCodes}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>{expense.code}</Text>
                        </View>
                        <Text style={styles.listItemTitle} numberOfLines={2}>
                          {expense.description}
                        </Text>
                      </View>
                      <Text style={styles.listItemMeta}>
                        {app.categoryNames.get(expense.categoryId) ?? 'Sin categoría'} ·{' '}
                        {formatShortDate(expense.date)}
                      </Text>
                      <View style={styles.badgeRow}>
                        <Badge label={`Quincena ${expense.fortnight}`} tone="neutral" />
                        <Badge label={incomeLabel(expense)} tone="info" />
                      </View>
                      {expense.notes ? (
                        <Text style={styles.listItemNotes} numberOfLines={3}>
                          {expense.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.listItemAmount}>{format(expense.amount)}</Text>
                  </View>

                  <View style={styles.listItemActions}>
                    <Button
                      label="Eliminar"
                      variant="danger"
                      size="small"
                      icon="trash-can-outline"
                      onPress={() => setPendingDelete(expense)}
                      accessibilityLabel={`Eliminar gasto ${expense.code}`}
                    />
                    <Button
                      label="Editar"
                      variant="secondary"
                      size="small"
                      icon="pencil-outline"
                      onPress={() => openEdit(expense)}
                      accessibilityLabel={`Editar gasto ${expense.code}`}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          <Card title="Distribución por quincena">
            <View style={styles.chart}>
              <View style={styles.chartRow}>
                <View style={styles.chartRowHeader}>
                  <Text style={styles.chartLabel}>Primera quincena</Text>
                  <Text style={styles.chartValue}>{format(totalFirst)}</Text>
                </View>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartFill,
                      barFillStyle(total > 0 ? (totalFirst / total) * 100 : 0, colors.primary),
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.footnote}>
                La segunda quincena concentra el {formatPercent(total > 0 ? totalSecond / total : 0, 1)}{' '}
                del gasto del período.
              </Text>
            </View>
          </Card>
        </>
      )}

      {formVisible ? (
        <ExpenseForm
          visible
          expense={editing}
          categories={app.categories}
          incomes={app.incomes}
          onClose={() => setFormVisible(false)}
          onSubmit={(draft) => (editing ? app.editExpense(editing, draft) : app.addExpense(draft))}
        />
      ) : null}

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Eliminar gasto"
        message={
          pendingDelete
            ? `Se eliminará el gasto ${pendingDelete.code} (${pendingDelete.description}) de forma definitiva.`
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
