/**
 * Pantalla "Inicio": tablero financiero (hoja "Dashboard" de la hoja original).
 *
 * Reproduce los indicadores y gráficas del archivo base:
 *  - resumen de ingresos, gastos, balance, tasa de ahorro y gasto diario,
 *  - semáforo del ahorro,
 *  - gasto por categoría y por periodicidad,
 *  - ranking de los 5 gastos más altos,
 *  - recomendaciones automáticas.
 */
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge } from '../components/Badge';
import { BarChart } from '../components/BarChart';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState, LoadingState } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { StatCard } from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { styles } from '../styles/styles';
import { formatCount, formatMoney, formatPercent } from '../utils/money';
import { formatShortDate } from '../utils/dates';

export default function DashboardScreen() {
  const { currency, dashboard, loading, incomes, expenses, categoryNames } = useApp();
  const format = (value: number) => formatMoney(value, currency);
  const { summary, byCategory, byPeriodicity, topExpenses, recommendations } = dashboard;
  const hasData = incomes.length > 0 || expenses.length > 0;

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!hasData) {
    return (
      <Screen>
        <PageHeader
          title="Inicio"
          description="Aquí verás el balance de la familia: ingresos, gastos, ahorro y recomendaciones."
        />
        <EmptyState
          icon="wallet-outline"
          title="Aún no hay movimientos"
          description="Registra tu primer ingreso para que el tablero calcule el balance mensual, la tasa de ahorro y las gráficas."
          action={
            <Button
              label="Registrar ingreso"
              icon="plus"
              onPress={() => router.push('/ingresos')}
            />
          }
        />
      </Screen>
    );
  }

  const periodRows = byPeriodicity.filter((row) => row.actual > 0 || row.projected > 0);

  return (
    <Screen>
      <PageHeader
        title="Inicio"
        description="Resumen mensual del hogar. Los ingresos se normalizan a valor mensual según su periodicidad."
      />

      {/* Semáforo y ratios principales */}
      <View style={styles.rowWrap}>
        <Badge label={summary.statusLabel} tone={summary.statusTone} />
        <Badge
          label={`Ahorro ${formatPercent(summary.savingsRate, 1)}`}
          tone={summary.savingsRate >= 0.2 ? 'success' : summary.savingsRate >= 0.1 ? 'warning' : summary.savingsRate >= 0 ? 'info' : 'danger'}
        />
        <Badge
          label={`Gastos ${formatPercent(summary.expenseRatio, 1)} del ingreso`}
          tone={summary.expenseRatio > 0.8 ? 'danger' : 'neutral'}
        />
      </View>

      {/* Cifras destacadas */}
      <View style={styles.grid}>
        <StatCard
          style={styles.gridItem}
          label="Ingresos mensuales"
          value={format(summary.incomeMonthly)}
          hint={`${formatCount(summary.incomeSources)} fuente(s) registrada(s)`}
        />
        <StatCard
          style={styles.gridItem}
          label="Ingresos anuales"
          value={format(summary.incomeAnnual)}
          hint="Mensual × 12"
        />
        <StatCard
          style={styles.gridItem}
          label="Gastos mensuales"
          value={format(summary.expenseMonthly)}
          hint={`${formatCount(summary.expenseCount)} gasto(s) registrado(s)`}
        />
        <StatCard
          style={styles.gridItem}
          label="Gastos anuales"
          value={format(summary.expenseAnnual)}
          hint="Mensual × 12"
        />
        <StatCard
          style={styles.gridItem}
          label="Balance mensual"
          value={format(summary.balanceMonthly)}
          hint="Ingresos − gastos"
        />
        <StatCard
          style={styles.gridItem}
          label="Gasto diario disponible"
          value={format(summary.dailyCapacity)}
          hint="Balance ÷ 30 días"
        />
      </View>

      {/* Gasto por categoría */}
      <Card title="Gasto por categoría">
        {byCategory.length === 0 ? (
          <EmptyState
            icon="tag-multiple-outline"
            title="Sin categorías de gasto"
            description="Crea categorías de gasto para ver cómo se distribuye el dinero."
          />
        ) : (
          <BarChart
            labels={byCategory.map((row) => row.name)}
            series={[
              {
                label: 'Gasto',
                color: '#B91C1C',
                values: byCategory.map((row) => row.amount),
              },
            ]}
            formatValue={format}
          />
        )}
      </Card>

      {/* Gasto por periodicidad: real vs presupuestado */}
      <Card title="Gasto por periodicidad (real vs. presupuestado)">
        {periodRows.length === 0 ? (
          <EmptyState
            icon="chart-box-outline"
            title="Sin presupuestos"
            description="Asigna montos sugeridos en la pantalla de Presupuesto para compararlos con el gasto real."
          />
        ) : (
          <BarChart
            labels={periodRows.map((row) => row.periodicity)}
            series={[
              { label: 'Real', color: '#1D4ED8', values: periodRows.map((row) => row.actual) },
              { label: 'Presupuestado', color: '#94A3B8', values: periodRows.map((row) => row.projected) },
            ]}
            formatValue={format}
          />
        )}
      </Card>

      {/* Top 5 gastos */}
      <Card title="5 gastos más altos">
        {topExpenses.length === 0 ? (
          <EmptyState
            icon="cash-minus"
            title="Sin gastos registrados"
            description="Cuando registres gastos aparecerán aquí los más altos."
            action={<Button label="Registrar gasto" icon="plus" onPress={() => router.push('/gastos')} />}
          />
        ) : (
          <View>
            {topExpenses.map(({ rank, expense }, index) => (
              <View
                key={expense.id}
                style={[styles.topExpenseRow, index === topExpenses.length - 1 && styles.topExpenseRowLast]}
                accessible
                accessibilityLabel={`Puesto ${rank}: ${expense.description}, ${format(expense.amount)}`}
              >
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{rank}</Text>
                </View>
                <View style={styles.topExpenseInfo}>
                  <Text style={styles.textBold} numberOfLines={1}>
                    {expense.description}
                  </Text>
                  <Text style={styles.textMuted} numberOfLines={1}>
                    {categoryNames.get(expense.categoryId) ?? 'Sin categoría'} ·{' '}
                    {formatShortDate(expense.date)}
                  </Text>
                </View>
                <Text style={styles.topExpenseAmount}>{format(expense.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Recomendaciones automáticas */}
      <Card title="Recomendaciones">
        <View style={styles.recommendationList}>
          {recommendations.map((item) => (
            <View key={item.id} style={styles.recommendationItem}>
              <Badge label={item.tone === 'success' ? 'Bien' : item.tone === 'danger' ? 'Alerta' : 'Atención'} tone={item.tone} />
              <Text style={styles.recommendationText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footnote}>
          Los cálculos son orientativos y no constituyen asesoramiento financiero.
        </Text>
      </Card>
    </Screen>
  );
}
