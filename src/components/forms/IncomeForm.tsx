/**
 * Formulario de ingresos (alta y edición) en ventana modal.
 * La validación la ejecuta el servicio; aquí solo se muestran los mensajes.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { MAX_LENGTH, PERIODICITIES } from '../../constants/app';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { IncomeDraft } from '../../services/incomesService';
import { styles } from '../../styles/styles';
import type { Category, Income, Periodicity } from '../../types';
import { getToday } from '../../utils/dates';
import { Button } from '../Button';
import { SelectField, TextField } from '../Fields';
import { ModalCard } from '../ModalCard';

/**
 * Los valores iniciales se calculan al montar el componente; la pantalla lo
 * monta solo cuando la ventana está abierta, así el formulario siempre empieza
 * limpio (o con los datos del registro que se edita).
 */
export function IncomeForm({
  visible,
  income,
  categories,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  /** Ingreso a editar; null o undefined = alta nueva. */
  income: Income | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (draft: IncomeDraft) => Promise<unknown>;
}) {
  const action = useAsyncAction();
  const [date, setDate] = useState(() => income?.date ?? getToday());
  const [description, setDescription] = useState(() => income?.description ?? '');
  const [categoryId, setCategoryId] = useState(() => income?.categoryId ?? '');
  const [amount, setAmount] = useState(() => (income ? String(income.amount) : ''));
  const [periodicity, setPeriodicity] = useState<Periodicity>(
    () => income?.periodicity ?? 'Mensual',
  );
  const [notes, setNotes] = useState(() => income?.notes ?? '');

  const options = categories
    .filter((category) => category.type === 'ingreso')
    .map((category) => ({ value: category.id, label: category.name }));

  const submit = async () => {
    const success = await action.run(() =>
      onSubmit({ date, description, categoryId, amount, periodicity, notes }),
    );
    if (success) onClose();
  };

  return (
    <ModalCard
      visible={visible}
      title={income ? `Editar ingreso ${income.code}` : 'Nuevo ingreso'}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" size="small" onPress={onClose} disabled={action.busy} />
          <Button label="Guardar" size="small" onPress={submit} loading={action.busy} />
        </>
      }
    >
      <View style={styles.form}>
        {options.length === 0 ? (
          <Text style={styles.fieldHint}>
            No hay categorías de ingreso: créala primero en la pantalla Categorías.
          </Text>
        ) : null}

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
          placeholder="Ej: Salario de octubre"
          maxLength={MAX_LENGTH.description}
        />

        <SelectField
          label="Categoría"
          value={categoryId}
          options={options}
          onChange={setCategoryId}
          placeholder="Seleccionar categoría…"
        />

        <SelectField
          label="Periodicidad"
          value={periodicity}
          options={PERIODICITIES.map((item) => ({ value: item, label: item }))}
          onChange={(value) => setPeriodicity(value as Periodicity)}
          hint="Define a cuánto equivale el monto por mes."
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
