# Para Examples Hub

Welcome! This repository is a central collection of example applications demonstrating various ways to integrate and use
the `@getpara/*` suite of SDKs and packages across different platforms and frameworks.

> **Important:** All examples in this repository use the **2.0.0-alpha** version of `@getpara/*` SDKs. This is the recommended approach for ALL projects - whether migrating existing projects or starting new ones. The 2.0.0-alpha release contains most major improvements and is the actively developed version.

Whether you're building a web app, mobile app, backend service, or something more specialized, you can browse these
examples to find patterns and integration guides.

## Repository Structure

The examples are organized into top-level directories based on the primary platform or environment:

- **`/web`**: Contains examples for web application frontends.
  - These are further subdivided by framework and/or bundler (e.g., `/web/with-react-nextjs`, `/web/with-react-vite`,
    `/web/with-svelte-vite`).
- **`/mobile`**: Contains examples for mobile applications.
  - These are further subdivided by platform or framework (e.g., `/mobile/with-expo`, `/mobile/with-react-native`,
    `/mobile/with-flutter`).
- **`/server`**: Contains examples for server-side or backend applications.
  - These are further subdivided by runtime or framework (e.g., `/server/with-node`, `/server/with-bun`,
    `/server/with-deno`).
- **`/specialized`**: Contains examples for specific use cases, integrations, or less common platforms.
  - Examples include integrations with Electron.js, Telegram Web Apps, specific DeFi protocols, etc. (e.g.,
    `/specialized/with-electronjs`, `/specialized/with-jupiter-dex-api`).

Each specific example (e.g., `/web/with-react-nextjs/para-modal`) lives within its own directory and aims to be
self-contained with its own dependencies and configuration.

> **Note:** The root-level `.env.ci.example` and `package.json` files are strictly for CI/CD purposes and are not related to individual example apps. Each example has its own `.env.example` and README with specific setup instructions.

## Getting Started with an Example

Most examples are designed to be run independently. Follow these general steps:

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/getpara/examples-hub.git](https://github.com/getpara/examples-hub.git)
    cd examples-hub
    ```

2.  **Navigate to an Example:** Change directory into the specific example you are interested in:

    ```bash
    # Example: Navigate to the Para Modal example using React + Next.js
    cd web/with-react-nextjs/para-modal
    ```

3.  **Install Dependencies:** Use Yarn (which is primarily used in this repository) to install the example's specific
    dependencies. Check the example's own README if a different package manager is required (e.g., `flutter pub get` for
    Flutter).

    ```bash
    yarn install
    ```

4.  **Configure Environment Variables:** Many examples require API keys, RPC URLs, or other configuration settings. Look
    for a `.env.example`, `config.example.ts`, or similar file within the example's directory. Copy it to a new file
    (e.g., `.env`) and populate it with your specific values.

    ```bash
    # Example using .env
    cp .env.example .env
    # Now edit .env with your values using your preferred editor
    nano .env
    ```

    > **Need API Keys?** Visit [developer.getpara.com](https://developer.getpara.com) to configure and manage your API keys.

5.  **Run the Example:** Each example directory should contain its own `README.md` with specific instructions on how to
    run it (e.g., `yarn dev`, `yarn start`, `expo start`, `flutter run`). Please refer to those instructions.

## Resources

- **Documentation:** Visit [docs.getpara.com](https://docs.getpara.com) to learn more about package usage and integration guides.
- **Developer Portal:** Visit [developer.getpara.com](https://developer.getpara.com) to configure and manage your API keys.

## Support

If you encounter issues with a specific example or have questions about using the `@getpara/*` SDKs demonstrated here,
please reach out to us directly at [support@getpara.com](mailto:support@getpara.com).

---

Happy Building!
