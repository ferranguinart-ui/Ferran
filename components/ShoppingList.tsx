
import React from 'react';
import ShoppingItem from './ShoppingItem';
import { ShoppingItem as ItemType } from '../types';

interface ShoppingListProps {
  items: ItemType[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string) => void;
  onUpdateStore?: (id: string, store: string) => void;
  moveLabel?: string;
  activeStore?: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggle, onDelete, onMove, onUpdateStore, moveLabel, activeStore }) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map(item => (
        <ShoppingItem 
          key={item.id} 
          item={item} 
          onToggle={onToggle} 
          onDelete={onDelete}
          onMove={onMove}
          onUpdateStore={onUpdateStore}
          moveLabel={moveLabel}
          activeStore={activeStore}
        />
      ))}
    </div>
  );
};

export default ShoppingList;
