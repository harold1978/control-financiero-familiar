/**
 * Formulario de categorías (alta y edición) en ventana modal.
 * El nombre debe ser único dentro del mismo tipo (ingreso o gasto).
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import { MAX_LENGTH } from '../../constants/app';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { CategoryDraft } from '../../services/categoriesService';
import { styles } from '../../styles/styles';
import type { Category, TransactionType } from '../../types';
import { Button } from '../Button';
import { SelectField, TextField } from '../Fields';
import { ModalCard } from '../ModalCard';

export function CategoryForm({
  visible,
  category,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  /** Categoría a editar; null o undefined = alta nueva. */
  category: Category | null;
  onClose: () => void;
  onSubmit: (draft: CategoryDraft) => Promise<unknown>;
}) {
  const action = useAsyncAction();
  const [type, setType] = useState<TransactionType>(() => category?.type ?? 'gasto');
  const [name, setName] = useState(() => category?.name ?? '');
  const [description, setDescription] = useState(() => category?.description ?? '');

  const submit = async () => {
    const success = await action.run(() => onSubmit({ type, name, description }));
    if (success) onClose();
  };

  return (
    <ModalCard
      visible={visible}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" size="small" onPress={onClose} disabled={action.busy} />
          <Button label="Guardar" size="small" onPress={submit} loading={action.busy} />
        </>
      }
    >
      <View style={styles.form}>
        <SelectField
          label="Tipo"
          value={type}
          options={[
            { value: 'gasto', label: 'Gasto' },
            { value: 'ingreso', label: 'Ingreso' },
          ]}
          onChange={(value) => setType(value as TransactionType)}
        />

        <TextField
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Servicios"
          maxLength={MAX_LENGTH.name}
          hint="Debe ser único dentro del mismo tipo."
        />

        <TextField
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Para qué sirve esta categoría (opcional)"
          maxLength={MAX_LENGTH.notes}
          multiline
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
