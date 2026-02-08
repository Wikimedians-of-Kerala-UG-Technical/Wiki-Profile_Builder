"use client";

import React, { useCallback } from 'react';
// use native drag/drop to avoid extra dependency
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

function genId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`; }

export function ImageUploader() {
  const { images, addImage, removeImage } = useStore();

  const onDropFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localId = genId();
      // Add a local preview item (frontend only, no upload)
      addImage({ id: localId, name: file.name, url: URL.createObjectURL(file), uploaded: false });
    }
  }, [addImage]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDropFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDropFiles(e.target.files);
  };

  return (
    <div className="space-y-3">
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="border-dashed border-2 rounded-md p-4 text-center border-gray-300 bg-white">
        <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" id="image-uploader-input" />
        <label htmlFor="image-uploader-input" className="cursor-pointer">
          <p className="text-sm text-gray-600">Drag & drop images here, or click to select files</p>
          <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF supported. Images are stored locally for preview.</p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="border rounded-md overflow-hidden bg-white p-2 text-xs">
              <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                {img.url ? <img src={img.url} alt={img.name} className="max-h-full" /> : <div className="text-gray-400">No preview</div>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate">{img.name}</span>
                <Button size="xs" variant="ghost" onClick={() => removeImage(img.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
