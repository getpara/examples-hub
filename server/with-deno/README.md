## Deno Server Example

This example demonstrates how to integrate the Para SDK with a Deno server. The server includes routes for wallet
creation and signing using different libraries.

### Running the Example

1. Install dependencies (optional):
   ```bash
   deno cache --reload server.ts
   ```
2. Start the server:
   ```bash
   deno task dev
   ```

Alternatively, you can run directly:

```bash
deno run --watch -R server.ts
```

Ensure that you configure the \***\*`.env`\*\*** file using \***\*`.env.example`\*\***.

### Available Routes

The server starts on port `8000`, and the following routes are available for interacting with the wallet functionality.
Each route requires an `email` in the body of the request.

#### Example Requests

- **Create Wallet**

  ```bash
  curl -X POST http://localhost:8000/wallets/create -H "Content-Type: application/json" -d '{"email": "user@example.com"}'
  ```

For more details, visit the [Para SDK documentation](https://docs.usepara.com/welcome).
