# Para Bulk Pregen Wallet Example

A Next.js application demonstrating bulk pre-generation of wallets using the Para SDK.

## Setup

1.  **Clone the repository (if you haven't already):**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Create Environment File:** Copy the example environment file to a local one:

    ```bash
    cp .env.example .env.local
    ```

3.  **Add API Key:** Open the newly created `.env.local` file and add your Para API Key:

    ```env
    # .env.local
    PARA_API_KEY=your_para_api_key_here
    ```

    _Replace `your_para_api_key_here` with your actual key._

4.  **Install Dependencies:** Using Yarn:
    ```bash
    yarn install
    ```
    _(Or if you prefer npm: `npm install`)_

## Running the Development Server

1.  **Start the app:**

    ```bash
    yarn dev
    ```

    _(Or if you prefer npm: `npm run dev`)_

2.  Open [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal) in your browser to view
    the application.
