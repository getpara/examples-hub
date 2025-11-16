# Bulk Wallet Pre-generation Example

This example demonstrates how to bulk pre-generate wallets for Twitter/X and Telegram handles using Para SDK 2.0.0-alpha. It showcases a clean architecture pattern with proper separation of concerns through hooks and components.

## Features

- **Bulk CSV Upload**: Upload a CSV file with handles and their types
- **Manual Handle Entry**: Add individual handles through a form
- **Batch Processing**: Process wallet creation in batches with progress tracking
- **Results Management**: View, export, and retry failed wallet creations
- **Clean Architecture**: Organized with hooks, context providers, and reusable components

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Note: The API key is needed both for client-side (prefixed with `NEXT_PUBLIC_`) and server-side operations.

### Installation

```bash
# Using yarn (recommended)
yarn install

# Using npm
npm install

# Using pnpm
pnpm install
```

## Architecture

### Directory Structure

```
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   └── wallet/          # Wallet generation endpoints
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── bulk/               # Bulk generation components
│   │   ├── BulkActions.tsx
│   │   ├── HandleEntryForm.tsx
│   │   ├── HandleListTable.tsx
│   │   ├── ProcessingStatus.tsx
│   │   └── ResultsSummary.tsx
│   └── ui/                 # Reusable UI components
├── config/                 # Configuration
│   └── constants.ts        # Environment variables
├── context/                # React Context providers
│   ├── ParaProvider.tsx    # Para SDK provider
│   └── QueryProvider.tsx   # TanStack Query provider
├── hooks/                  # Custom React hooks
│   ├── use-batch-processor.ts
│   ├── use-bulk-results.ts
│   ├── use-csv-export.ts
│   ├── use-csv-parser.ts
│   └── use-handle-manager.ts
└── lib/                    # Utility libraries
    ├── para/               # Para SDK utilities
    │   └── server-client.ts
    └── store.ts            # Wallet storage (demo)
```

### Key Hooks

- **`use-csv-parser`**: Handles CSV file parsing and template download
- **`use-handle-manager`**: Manages the list of handles to process
- **`use-batch-processor`**: Processes wallet creation in batches
- **`use-bulk-results`**: Manages results state and summary statistics
- **`use-csv-export`**: Exports results to CSV format

### CSV Format

The CSV file should have the following format:

```csv
handle,type
@username1,twitter
@username2,telegram
username3,twitter
```

Headers are optional and automatically detected.

## Development

### Running the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Type Checking

```bash
yarn typecheck
```

### Linting

```bash
yarn lint
```

## API Changes (v1.x to v2.x)

The Para SDK 2.0.0-alpha introduces changes to the pre-generation API:

### Old (v1.x)
```typescript
para.createPregenWallet({
  type: WalletType.EVM,
  pregenIdentifier: handle,
  pregenIdentifierType: "TWITTER"
})
```

### New (v2.x)
```typescript
para.createPregenWallet({
  type: WalletType.EVM,
  pregenId: { xUsername: handle }  // For Twitter/X
})
```

## Important Notes

- The wallet store uses an in-memory implementation for demo purposes. In production, use a proper database.
- Twitter handles are now referenced as `xUsername` in the v2.0.0-alpha SDK
- Batch processing includes a 1-second delay between batches to avoid API rate limits
- The application requires wallet connection before accessing bulk generation features

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para SDK Reference](https://github.com/getpara/para-sdk)
- [Next.js Documentation](https://nextjs.org/docs)