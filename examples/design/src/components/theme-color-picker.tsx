'use client';

import { useState, useEffect } from 'react';
import { ColorPicker } from '@/components/ui/color-picker';
import { generateThemeFromColor, applyTheme } from '@/lib/theme-generator-oklch';

export function ThemeColorPicker() {
  const [color, setColor] = useState('#3b82f6');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('custom-theme-color');
    if (saved) {
      const savedColor = JSON.parse(saved);
      setColor(savedColor);
      handleColorChange(savedColor);
    }
  }, []);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const theme = generateThemeFromColor(newColor);
    applyTheme(theme);
    localStorage.setItem('custom-theme-color', JSON.stringify(newColor));
  };

  return <ColorPicker value={color} onChange={handleColorChange} size="icon" />;
}
