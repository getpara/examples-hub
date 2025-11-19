# Para Prototypes

A collection of modern, themeable UI prototypes built with Next.js, TypeScript, and Tailwind CSS. This repository contains various interface components and pages, including a wallet selection modal for cryptocurrency applications.

## Features

- **Multi-chain Support**: Ethereum, Solana, and Cosmos wallet selection
- **Dynamic Theming**: Light/dark mode with custom color picker
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Components**: Hover effects, tooltips, and smooth animations
- **Wallet Management**: Select multiple wallets with visual feedback
- **Create Wallet Option**: Add new wallet functionality
- **Popup Integration**: Designed to work as a popup window

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Theme Management**: next-themes
- **Color Generation**: chroma-js (OKLCH color space)
- **Animations**: Framer Motion

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd para-prototypes
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with auth modal
│   ├── portal/            # Portal page
│   ├── wallet-selection/  # Wallet selection popup page
│   ├── layout.tsx         # Root layout with theme provider
│   └── globals.css        # Global styles and theme variables
├── components/
│   ├── ui/                # Shadcn/ui components
│   ├── custom/            # Custom components
│   └── theme-*.tsx        # Theme-related components
└── lib/                   # Utilities and theme generation
```

## Available Pages

- **`/`** - Home page with authentication modal
- **`/portal`** - Portal page with popup launcher
- **`/wallet-selection`** - Wallet selection interface (designed for popup)

## Key Components

### WalletItem

Custom component for displaying wallet options with:

- Logo display
- Wallet name and address
- Balance information
- Selection state with visual feedback
- "Create Wallet" variant

### Theme System

- **Dynamic Color Generation**: Uses OKLCH color space for better color manipulation
- **Theme Persistence**: Saves custom themes to localStorage
- **Multiple Themes**: Light, dark, and custom color themes
- **CSS Variables**: Comprehensive theming system using CSS custom properties

## Usage

### Running as Popup

The wallet selection page is designed to be opened in a popup window:

```javascript
// From portal page
const popup = window.open(
  "/wallet-selection",
  "wallet-selection",
  "width=500,height=600,scrollbars=yes,resizable=yes"
);
```

### Theme Customization

1. Use the color picker in the navbar to generate custom themes
2. Themes are automatically saved and persist across sessions
3. Switch between light/dark modes using the theme toggle

## Development

### Adding New Wallet Types

1. Add blockchain icon to `public/` directory
2. Create new section in `wallet-selection/page.tsx`
3. Add wallet items with appropriate logos

### Customizing Components

- Modify Shadcn components in `src/components/ui/`
- Create custom components in `src/components/custom/`
- Update theme variables in `src/app/globals.css`

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

No environment variables are currently required for basic functionality.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

**Images not loading:**

- Ensure images are in the `public/` directory
- Check file paths don't contain spaces
- Verify file extensions match exactly

**Theme not applying:**

- Clear browser cache
- Check CSS variables in `globals.css`
- Verify `next-themes` is properly configured

**Styling issues:**

- Ensure Tailwind CSS v4 is properly configured
- Check for conflicting CSS classes
- Verify `@theme` directive in `globals.css`

## Acknowledgments

- Built with [Shadcn/ui](https://ui.shadcn.com/) components
- Powered by [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)


<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; xmlns:xlink=\&quot;http://www.w3.org/1999/xlink\&quot; viewBox=\&quot;0 0 127 48\&quot;><path d=\&quot;M 115.824 35.448 C 109.328 35.448 105.136 30.456 105.136 23.576 C 105.136 16.664 109.36 11.672 115.856 11.672 C 121.584 11.672 125.136 15.32 125.68 19.896 L 122 19.896 C 121.584 17.656 120.176 14.712 115.792 14.712 C 110.736 14.712 108.816 19 108.816 23.544 C 108.816 28.12 110.736 32.408 115.792 32.408 C 120.208 32.408 121.776 29.464 122 26.68 L 125.68 26.68 C 125.168 31.768 121.584 35.448 115.824 35.448 Z\&quot; fill=\&quot;rgb(255,255,255)\&quot;></path><path d=\&quot;M 84.913 35 L 84.913 12.12 L 94.545 12.12 C 99.249 12.12 102.001 14.232 102.001 17.88 C 102.001 20.696 100.337 22.008 98.449 22.648 L 98.449 22.712 C 100.849 23.128 102.897 24.888 102.897 28.312 C 102.897 32.696 99.857 35 95.121 35 Z M 88.433 31.96 L 94.865 31.96 C 98.257 31.96 99.217 30.328 99.217 28.184 C 99.217 25.784 97.745 24.408 95.345 24.408 L 88.433 24.408 Z M 88.433 21.624 L 94.449 21.624 C 97.329 21.624 98.321 20.44 98.321 18.392 C 98.321 16.376 97.105 15.16 94.705 15.16 L 88.433 15.16 Z\&quot; fill=\&quot;rgb(255,255,255)\&quot;></path><path d=\&quot;M 73.302 35.448 C 67.51 35.448 63.446 32.44 63.19 27.288 L 66.838 27.288 C 67.094 30.36 68.918 32.44 73.206 32.44 C 76.886 32.44 78.006 30.84 78.006 28.76 C 78.006 25.848 75.766 25.432 71.606 24.376 C 68.022 23.416 64.086 22.264 64.086 17.912 C 64.086 13.944 67.158 11.672 72.086 11.672 C 77.302 11.672 80.694 14.328 81.046 18.936 L 77.398 18.936 C 77.014 16.184 75.446 14.68 72.118 14.68 C 69.238 14.68 67.766 15.736 67.766 17.72 C 67.766 20.28 70.166 20.824 73.11 21.56 C 77.526 22.68 81.686 23.736 81.686 28.568 C 81.686 32.504 79.03 35.448 73.302 35.448 Z\&quot; fill=\&quot;rgb(255,255,255)\&quot;></path><path d=\&quot;M 24 48 C 37.255 48 48 37.255 48 24 C 48 10.745 37.255 0 24 0 C 10.745 0 0 10.745 0 24 C 0 37.255 10.745 48 24 48 Z\&quot; fill=\&quot;rgb(105,56,239)\&quot;></path><path d=\&quot;M 24 45 C 35.598 45 45 35.598 45 24 C 45 12.402 35.598 3 24 3 C 12.402 3 3 12.402 3 24 C 3 35.598 12.402 45 24 45 Z\&quot; fill=\&quot;rgb(135,96,242)\&quot;></path><path d=\&quot;M 24 42 C 33.941 42 42 33.941 42 24 C 42 14.059 33.941 6 24 6 C 14.059 6 6 14.059 6 24 C 6 33.941 14.059 42 24 42 Z\&quot; fill=\&quot;rgb(165,136,245)\&quot;></path><path d=\&quot;M 24 39 C 32.284 39 39 32.284 39 24 C 39 15.716 32.284 9 24 9 C 15.716 9 9 15.716 9 24 C 9 32.284 15.716 39 24 39 Z\&quot; fill=\&quot;rgb(195,175,249)\&quot;></path><path d=\&quot;M 24 36 C 30.627 36 36 30.627 36 24 C 36 17.372 30.627 12 24 12 C 17.373 12 12 17.372 12 24 C 12 30.627 17.373 36 24 36 Z\&quot; fill=\&quot;rgb(225,215,252)\&quot;></path><path d=\&quot;M 24 33 C 28.971 33 33 28.97 33 24 C 33 19.029 28.971 15 24 15 C 19.029 15 15 19.029 15 24 C 15 28.97 19.029 33 24 33 Z\&quot; fill=\&quot;rgb(255,255,255)\&quot;></path><path d=\&quot;M 24 30 C 27.314 30 30 27.314 30 24 C 30 20.686 27.314 18 24 18 C 20.686 18 18 20.686 18 24 C 18 27.314 20.686 30 24 30 Z\&quot; fill=\&quot;rgb(105,56,239)\&quot;></path></svg>