import { createApiCollection } from '@/store/create-api-collection'

// GET /api/expense-categories → { id, name, description, isActive } (active categories only).
const categories = createApiCollection({ path: '/expense-categories' })

export const loadExpenseCategories = categories.load

export function findExpenseCategoryByName(name) {
  const key = name.trim().toLocaleLowerCase('az')
  return categories.getState().items.find((category) => category.name.toLocaleLowerCase('az') === key) ?? null
}

// Adds a row returned by POST /api/expense-categories.
export function addExpenseCategory(category) {
  return categories.add(category)
}

export function useExpenseCategoriesStore() {
  const { items, isLoading, error, reload } = categories.useCollection()

  return { categories: items, isLoading, error, reload }
}
