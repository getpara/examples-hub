'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generateThemeFromColor, applyTheme } from '@/lib/theme-generator-oklch';

export function ColorThemePicker() {
  const [color, setColor] = useState('#3b82f6'); // Default blue

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const theme = generateThemeFromColor(newColor);
    applyTheme(theme);
    localStorage.setItem('custom-theme', JSON.stringify({ color: newColor, theme }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-10 h-10 p-0">
          <div className="para:w-6 para:h-6 para:rounded-full para:border-2" style={{ backgroundColor: color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="para:w-64">
        <div className="para:space-y-4">
          <h4 className="para:font-medium">Pick a theme color</h4>
          <input
            type="color"
            value={color}
            onChange={e => handleColorChange(e.target.value)}
            className="para:w-full para:h-32 para:cursor-pointer"
          />
          <div className="para:flex para:gap-2 para:flex-wrap">
            {presetColors.map(preset => (
              <button
                key={preset}
                onClick={() => handleColorChange(preset)}
                className="para:w-8 para:h-8 para:rounded-full para:border-2 para:hover:scale-110 para:transition-transform"
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const presetColors = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Green
  '#06b6d4', // Cyan
];
