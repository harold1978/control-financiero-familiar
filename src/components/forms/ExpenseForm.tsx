/**
 * Formulario de gastos (alta y edición) en ventana modal.
 * Incluye la quincena y el ingreso del que se destinó el dinero.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { FORTNIGHTS, MAX_LENGTH } from '../../constants/app';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { ExpenseDraft } from '../../services/expensesService';
import { styles } from '../../styles/styles';
import type { Category, Expense, Fortnight, Income } from '../../types';
import { getToday } from '../../utils/dates';
import { Button } from '../Button';
import { SelectField, TextField } from '../Fields';
import { ModalCard } from '../ModalCard';

/** Valor del selector que significa "sin ingreso asociado". */
const NO_INCOME = '';

export function ExpenseForm({
  visible,
  expense,
  categories,
  incomes,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  /** Gasto a editar; null o undefined = alta nueva. */
  expense: Expense | null;
  categories: Category[];
  incomes: Income[];
  onClose: () => void;
  onSubmit: (draft: ExpenseDraft) => Promise<unknown>;
}) {
  const action = useAsyncAction();
  const [date, setDate] = useState(() => expense?.date ?? getToday());
  const [description, setDescription] = useState(() => expense?.description ?? '');
  const [categoryId, setCategoryId] = useState(() => expense?.categoryId ?? '');
  const [incomeId, setIncomeId] = useState(() => expense?.incomeId ?? NO_INCOME);
  const [amount, setAmount] = useState(() => (expense ? String(expense.amount) : ''));
  const [fortnight, setFortnight] = useState<Fortnight>(() => expense?.fortnight ?? 'Primera');
  const [notes, setNotes] = useState(() => expense?.notes ?? '');

  const categoryOptions = categories
    .filter((category) => category.type === 'gasto')
    .map((category) => ({ value: category.id, label: category.name }));

  const incomeOptions = [
    { value: NO_INCOME, label: 'Sin ingreso asociado' },
    ...incomes.map((income) => ({
      value: income.id,
      label: `${income.code} · ${income.description}`,
    })),
  ];

  const submit = async () => {
    const success = await action.run(() =>
      onSubmit({
        date,
        description,
        categoryId,
        incomeId: incomeId === NO_INCOME ? null : incomeId,
        amount,
        fortnight,
        notes,
      }),
    );
    if (success) onClose();
  };

  return (
    <ModalCard
      visible={visible}
      title={expense ? `Editar gasto ${expense.code}` : 'Nuevo gasto'}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" size="small" onPress={onClose} disabled={action.busy} />
          <Button label="Guardar" size="small" onPress={submit} loading={action.busy} />
        </>
      }
    >
      <View style={styles.form}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <TextField
              label="Fecha"
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Fecha en formato año mes día"
              hint="Formato AAAA-MM-DD"
            />
          </View>
          <View style={styles.fieldColumn}>
            <TextField
              label="Monto"
              value={amount}
              onChangeText={setAmount}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TextField
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: Supermercado"
          maxLength={MAX_LENGTH.description}
        />

        <SelectField
          label="Categoría"
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
          placeholder="Seleccionar categoría…"
        />

        <SelectField
          label="Ingreso asociado"
          value={incomeId}
          options={incomeOptions}
          onChange={setIncomeId}
          hint="Permite ver cuánto de ese ingreso ya se utilizó."
        />

        <SelectField
          label="Quincena"
          value={fortnight}
          options={FORTNIGHTS.map((item) => ({ value: item, label: item }))}
          onChange={(value) => setFortnight(value as Fortnight)}
        />

        <TextField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          placeholder="Información adicional (opcional)"
          multiline
          maxLength={MAX_LENGTH.notes}
        />

        {action.error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{action.error}</Text>
          </View>
        ) : null}
      </View>
    </ModalCard>
  );
}
