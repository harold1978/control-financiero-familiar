/**
 * Pantalla "Presupuesto": monto sugerido por categoría de gasto.
 * Reproduce la hoja "Presupuesto": sugerido, gasto real, diferencia, estado,
 * porcentaje de uso sobre el ingreso y la gráfica de 10 puntos (● / ○).
 */
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DataTable, type TableColumn } from '../components/DataTable';
import { EmptyState, LoadingState } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { UsageIndicator } from '../components/UsageIndicator';
import { BudgetForm } from '../components/forms/BudgetForm';
import { useApp } from '../context/AppContext';
import {
  styles,
  textToneStyle,
  toneForAmount,
} from '../styles/styles';
import { buildBudgetRows, type BudgetRow } from '../utils/calculations';
import { formatMoney, formatPercent } from '../utils/money';

export default function BudgetScreen() {
  const app = useApp();
  const format = (value: number) => formatMoney(value, app.currency);

  const [formVisible, setFormVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<BudgetRow | null>(null);

  const rows = useMemo(
    () =>
      buildBudgetRows({
        categories: app.categories,
        incomes: app.incomes,
        expenses: app.expenses,
        budgets: app.budgets,
      }),
    [app.categories, app.incomes, app.expenses, app.budgets],
  );

  const totalSuggested = rows.reduce((sum, row) => sum + row.suggestedAmount, 0);
  const totalReal = rows.reduce((sum, row) => sum + row.real, 0);
  const budgeted = rows.filter((row) => row.suggestedAmount > 0);

  const openEdit = (row: BudgetRow) => {
    setEditingRow(row);
    setFormVisible(true);
  };

  const columns: TableColumn<BudgetRow>[] = [
    {
      key: 'name',
      header: 'Categoría',
      width: 'colWide',
      render: (row) => <Text style={styles.tableCellStrong}>{row.name}</Text>,
    },
    {
      key: 'suggested',
      header: 'Presupuesto',
      width: 'colAmount',
      align: 'right',
      render: (row) => <Text style={styles.tableCellText}>{format(row.suggestedAmount)}</Text>,
    },
    {
      key: 'real',
      header: 'Real',
      width: 'colAmount',
      align: 'right',
      render: (row) => <Text style={styles.tableCellText}>{format(row.real)}</Text>,
    },
    {
      key: 'difference',
      header: 'Diferencia',
      width: 'colAmount',
      align: 'right',
      render: (row) => (
        <Text style={[styles.tableCellText, textToneStyle(toneForAmount(row.difference))]}>
          {format(row.difference)}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      width: 'colWide',
      render: (row) => (
        <Badge
          label={
            row.overBudget
              ? 'Presupuesto superado'
              : row.suggestedAmount > 0
                ? 'Dentro del presupuesto'
                : 'Sin presupuesto'
          }
          tone={row.overBudget ? 'danger' : row.suggestedAmount > 0 ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'usage',
      header: 'Usado',
      width: 'colPercent',
      align: 'right',
      render: (row) => (
        <Text style={styles.tableCellText}>
          {row.suggestedAmount > 0
            ? formatPercent(Math.min(row.real / row.suggestedAmount, 9.99), 0)
            : '—'}
        </Text>
      ),
    },
    {
      key: 'incomeShare',
      header: '% del ingreso',
      width: 'colPercent',
      align: 'right',
      render: (row) => <Text style={styles.tableCellSecondary}>{formatPercent(row.incomeShare, 1)}</Text>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: 'colMedium',
      render: (row) => (
        <Button
          label={row.suggestedAmount > 0 ? 'Editar' : 'Asignar'}
          variant="secondary"
          size="small"
          icon="pencil-outline"
          onPress={() => openEdit(row)}
          accessibilityLabel={`Editar presupuesto de ${row.name}`}
        />
      ),
    },
  ];

  const editing = editingRow
    ? app.budgets.find((budget) => budget.categoryId === editingRow.categoryId) ?? null
    : null;

  return (
    <Screen>
      <PageHeader
        title="Presupuesto"
        description="Define el monto sugerido por categoría de gasto. La diferencia es «presupuesto − gasto real»: un valor negativo significa que se superó el límite."
      />

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Presupuesto total</Text>
          <Text style={styles.summaryValue}>{format(totalSuggested)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Gasto real</Text>
          <Text style={styles.summaryValue}>{format(totalReal)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Diferencia</Text>
          <Text style={styles.summaryValue}>{format(totalSuggested - totalReal)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Categorías con presupuesto</Text>
          <Text style={styles.summaryValue}>
            {budgeted.length} / {rows.length}
          </Text>
        </View>
      </View>

      {app.loading ? (
        <LoadingState message="Cargando presupuesto…" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="chart-box-outline"
          title="Sin categorías de gasto"
          description="Primero crea categorías de gasto en la pantalla Categorías; cada una recibirá su presupuesto."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.categoryId}
            emptyTitle="Sin categorías"
            emptyMessage="Crea categorías de gasto para asignar presupuestos."
          />

          <Text style={styles.footnote}>
            «Usado» es el porcentaje del presupuesto consumido; «% del ingreso» es el gasto real de
            la categoría sobre los ingresos mensuales normalizados.
          </Text>

          <Card title="Gráfica de uso del presupuesto (10 puntos)">
            {budgeted.length === 0 ? (
              <EmptyState
                icon="chart-donut"
                title="Aún no hay presupuestos"
                description="Asigna un monto sugerido a alguna categoría para ver su gráfica de uso."
              />
            ) : (
              <View style={styles.list}>
                {budgeted.map((row) => (
                  <UsageIndicator
                    key={row.categoryId}
                    label={`Utilizado en ${row.name}`}
                    used={row.real}
                    total={row.suggestedAmount}
                    ratio={row.suggestedAmount > 0 ? Math.min(row.real / row.suggestedAmount, 1) : 0}
                    format={format}
                  />
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      {formVisible ? (
        <BudgetForm
          visible
          categoryName={editingRow?.name ?? ''}
          budget={editing}
          onClose={() => setFormVisible(false)}
          onSubmit={(draft) =>
            editingRow ? app.setBudget(editingRow.categoryId, draft) : Promise.resolve()
          }
        />
      ) : null}
    </Screen>
  );
}
