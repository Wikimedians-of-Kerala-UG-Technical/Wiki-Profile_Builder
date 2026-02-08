"use client";

import React, { useState } from 'react';
// lightweight id generator to avoid extra dependency
function genId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`; }
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useStore } from '@/store/useStore';

export function CategoryListEditor() {
  const { categories, addCategory, updateCategory, removeCategory } = useStore();
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addCategory({ id: genId(), label: newLabel.trim(), description: newDesc.trim() });
    setNewLabel('');
    setNewDesc('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Category label (e.g., Experience)" />
        <Button onClick={handleAdd} variant="secondary">Add</Button>
      </div>
      <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description for this category (optional)" rows={2} />

      {categories.length > 0 && (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="p-3 border rounded-md bg-white flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <strong>{cat.label}</strong>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => removeCategory(cat.id)}>Remove</Button>
                </div>
              </div>
              <Textarea value={cat.description || ''} onChange={(e) => updateCategory(cat.id, { description: e.target.value })} rows={3} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
