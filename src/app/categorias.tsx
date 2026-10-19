/**
 * Pantalla "Categorías": catálogo de ingresos y gastos (hoja "Categorias").
 * Permite crear, editar y eliminar categorías, y restablecer la lista base
 * que trae la hoja original.
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
import { CategoryForm } from '../components/forms/CategoryForm';
import { useApp } from '../context/AppContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { colors, styles } from '../styles/styles';
import type { Category, TransactionType } from '../types';

type TypeFilter = 'Todas' | TransactionType;

export default function CategoriesScreen() {
  const app = useApp();
  const deleteAction = useAsyncAction();
  const restoreAction = useAsyncAction();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('Todas');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [pendingRestore, setPendingRestore] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return app.categories
      .filter((category) => typeFilter === 'Todas' || category.type === typeFilter)
      .filter((category) =>
        query
          ? `${category.name} ${category.description}`.toLocaleLowerCase('es').includes(query)
          : true,
      )
      .sort(
        (a, b) =>
          a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'es'),
      );
  }, [app.categories, search, typeFilter]);

  const incomeCount = app.categories.filter((category) => category.type === 'ingreso').length;
  const expenseCount = app.categories.filter((category) => category.type === 'gasto').length;

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormVisible(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const success = await deleteAction.run(() => app.deleteCategory(pendingDelete.id));
    if (success) setPendingDelete(null);
  };

  const confirmRestore = async () => {
    const success = await restoreAction.run(() => app.restoreDefaultCategories());
    if (success) setPendingRestore(false);
  };

  return (
    <Screen>
      <PageHeader
        title="Categorías"
        description="Organiza tus ingresos y gastos. No se puede eliminar una categoría que tenga movimientos asociados."
        action={
          <Button label="Nueva categoría" icon="plus" onPress={openCreate} disabled={!app.configured} />
        }
      />

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Categorías de ingreso</Text>
          <Text style={styles.summaryValue}>{incomeCount}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Categorías de gasto</Text>
          <Text style={styles.summaryValue}>{expenseCount}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{app.categories.length}</Text>
        </View>
      </View>

      {app.loading ? (
        <LoadingState message="Cargando categorías…" />
      ) : (
        <>
          <View style={styles.filterBar}>
            <View style={styles.searchWrap}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar categoría…"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Buscar categorías"
                style={styles.searchInput}
              />
            </View>
            <View style={styles.chipRow}>
              {(['Todas', 'ingreso', 'gasto'] as const).map((type) => {
                const active = typeFilter === type;
                const label = type === 'Todas' ? 'Todas' : type === 'ingreso' ? 'Ingresos' : 'Gastos';
                return (
                  <Button
                    key={type}
                    label={label}
                    variant={active ? 'primary' : 'secondary'}
                    size="small"
                    onPress={() => setTypeFilter(type)}
                    accessibilityLabel={`Filtrar categorías: ${label}`}
                  />
                );
              })}
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState
              icon="tag-multiple-outline"
              title={app.categories.length === 0 ? 'Sin categorías' : 'Sin resultados'}
              description={
                app.categories.length === 0
                  ? 'Crea categorías o restablece la lista base de la hoja original.'
                  : 'Prueba con otra búsqueda u otro filtro.'
              }
              action={
                app.categories.length === 0 ? (
                  <View style={styles.rowWrap}>
                    <Button label="Nueva categoría" icon="plus" onPress={openCreate} />
                    <Button
                      label="Restablecer lista base"
                      variant="secondary"
                      icon="restore"
                      onPress={() => setPendingRestore(true)}
                    />
                  </View>
                ) : undefined
              }
            />
          ) : (
            <View style={styles.list}>
              {filtered.map((category) => (
                <View key={category.id} style={styles.listItem}>
                  <View style={styles.listItemTop}>
                    <View style={styles.grow}>
                      <View style={styles.listItemCodes}>
                        <Text style={styles.listItemTitle} numberOfLines={2}>
                          {category.name}
                        </Text>
                      </View>
                      <View style={styles.badgeRow}>
                        <Badge
                          label={category.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                          tone={category.type === 'ingreso' ? 'success' : 'info'}
                        />
                      </View>
                      {category.description ? (
                        <Text style={styles.listItemNotes} numberOfLines={3}>
                          {category.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.listItemActions}>
                    <Button
                      label="Eliminar"
                      variant="danger"
                      size="small"
                      icon="trash-can-outline"
                      onPress={() => setPendingDelete(category)}
                      accessibilityLabel={`Eliminar categoría ${category.name}`}
                    />
                    <Button
                      label="Editar"
                      variant="secondary"
                      size="small"
                      icon="pencil-outline"
                      onPress={() => openEdit(category)}
                      accessibilityLabel={`Editar categoría ${category.name}`}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          <Card title="Lista base">
            <Text style={styles.footnote}>
              La primera vez que se abre la aplicación con Firestore vacío se crean las categorías
              de la hoja original ({incomeCount} de ingreso y {expenseCount} de gasto).
            </Text>
            <View style={styles.rowWrap}>
              <Button
                label="Restablecer categorías base"
                variant="secondary"
                icon="restore"
                loading={restoreAction.busy}
                onPress={() => setPendingRestore(true)}
              />
            </View>
            {restoreAction.error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{restoreAction.error}</Text>
              </View>
            ) : null}
          </Card>
        </>
      )}

      {formVisible ? (
        <CategoryForm
          visible
          category={editing}
          onClose={() => setFormVisible(false)}
          onSubmit={(draft) =>
            editing ? app.editCategory(editing, draft) : app.addCategory(draft)
          }
        />
      ) : null}

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Eliminar categoría"
        message={
          pendingDelete
            ? `Se eliminará la categoría «${pendingDelete.name}» de forma definitiva.`
            : ''
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteAction.busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        visible={pendingRestore}
        title="Restablecer categorías base"
        message="Se añadirán las categorías de la hoja original que falten. Las que ya existen y tus movimientos no se tocan."
        confirmLabel="Restablecer"
        loading={restoreAction.busy}
        onConfirm={confirmRestore}
        onCancel={() => setPendingRestore(false)}
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
