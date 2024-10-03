export const calculateBrightness = (color: string): number => {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    console.error('Canvas 2D context not supported');
    return 0.5;
  }

  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return brightness;
};
