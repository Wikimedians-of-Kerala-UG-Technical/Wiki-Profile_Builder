"use client";

import React from 'react';
import { useStore } from '@/store/useStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ColorPaletteEditor() {
  const { palette, setPalette } = useStore();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
          <Input type="color" value={palette.primary} onChange={(e) => setPalette({ primary: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Accent Color</label>
          <Input type="color" value={palette.accent} onChange={(e) => setPalette({ accent: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Background</label>
          <Input type="color" value={palette.background} onChange={(e) => setPalette({ background: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Text Color</label>
          <Input type="color" value={palette.text} onChange={(e) => setPalette({ text: e.target.value })} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded shadow" style={{ background: palette.background, color: palette.text }}>
          <div style={{ background: palette.primary, color: '#ffffff', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px' }}>Header</div>
          <div style={{ background: palette.accent, color: palette.text, padding: '4px 8px', borderRadius: '4px' }}>Accent</div>
          <div style={{ marginTop: '4px' }}>Body text</div>
        </div>
        <Button variant="ghost" onClick={() => setPalette({ primary: '#0057B7', accent: '#e3f2fd', background: '#ffffff', text: '#202122' })}>Reset</Button>
      </div>
    </div>
  );
}
