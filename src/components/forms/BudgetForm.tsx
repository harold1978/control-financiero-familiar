/**
 * Formulario del presupuesto de una categoría de gasto.
 * Solo hay un presupuesto por categoría, por lo que el formulario guarda o reemplaza.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { PERIODICITIES } from '../../constants/app';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { BudgetDraft } from '../../services/budgetsService';
import { styles } from '../../styles/styles';
import type { Budget, Periodicity } from '../../types';
import { Button } from '../Button';
import { SelectField, TextField } from '../Fields';
import { ModalCard } from '../ModalCard';

export function BudgetForm({
  visible,
  categoryName,
  budget,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  /** Nombre de la categoría que se está presupuestando. */
  categoryName: string;
  /** Presupuesto existente (para editar); null si aún no tiene. */
  budget: Budget | null;
  onClose: () => void;
  onSubmit: (draft: BudgetDraft) => Promise<unknown>;
}) {
  const action = useAsyncAction();
  const [suggestedAmount, setSuggestedAmount] = useState(() =>
    budget ? String(budget.suggestedAmount) : '',
  );
  const [periodicity, setPeriodicity] = useState<Periodicity>(
    () => budget?.periodicity ?? 'Mensual',
  );

  const submit = async () => {
    const success = await action.run(() => onSubmit({ suggestedAmount, periodicity }));
    if (success) onClose();
  };

  return (
    <ModalCard
      visible={visible}
      title={`Presupuesto: ${categoryName}`}
      onClose={onClose}
      small
      footer={
        <>
          <Button label="Cancelar" variant="secondary" size="small" onPress={onClose} disabled={action.busy} />
          <Button label="Guardar" size="small" onPress={submit} loading={action.busy} />
        </>
      }
    >
      <View style={styles.form}>
        <TextField
          label="Monto sugerido"
          value={suggestedAmount}
          onChangeText={setSuggestedAmount}
          placeholder="0,00"
          keyboardType="decimal-pad"
          hint="Importe que quieres gastar en esta categoría."
        />

        <SelectField
          label="Periodicidad del presupuesto"
          value={periodicity}
          options={PERIODICITIES.map((item) => ({ value: item, label: item }))}
          onChange={(value) => setPeriodicity(value as Periodicity)}
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
