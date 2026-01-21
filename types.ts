
export type Status = 'ACTIVE' | 'DRAFT' | 'COMPLETED';

export interface ShoppingItem {
  id: string;
  name: string;
  store: string;
  category: string;
  emoji: string;
  status: Status;
  createdAt: number;
}

export interface FamilyData {
  code: string;
  items: ShoppingItem[];
}

export const STORES = ['Todos', 'Cualquiera', 'Mercadona', 'Lidl', 'Carrefour', 'Alcampo', 'Eroski', 'Otros'];
