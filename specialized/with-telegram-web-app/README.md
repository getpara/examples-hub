# Para Telegram Mini-App

<img width="445" alt="image" src="https://github.com/user-attachments/assets/eeaf9104-2c5a-423c-9a37-92e1ffea5d24">

This template provides a minimal setup to get Para Pre-generated wallets working in a Mini-App

## Key Steps

1. **Initialize the App**

   - When the mini-app starts, it calls `initializeApp()` which checks for an existing wallet.

2. **Generate Wallet**

   - If no wallet exists, `generateWallet()` is called to create a pre-generated wallet using
     `para.createWalletPreGen()`.

3. **Store Wallet Data**

   - After wallet creation, the user share and wallet ID need to be stored.
   - Due to storage limitations, data is chunked using `storeWithChunking()`.
   - This process runs asynchronously to avoid blocking the app.

4. **Retrieve Wallet Data**

   - When the app starts, it attempts to retrieve stored data using `retrieveChunkedData()`.
   - This function reassembles the chunked data.

5. **Sign Messages**

   - Once the wallet is set up, users can sign messages using `signMessage()`.

6. **Clear Storage**
   - Users can clear all stored data using `clearChunkedStorage()`.

Note: The app can start signing transactions as soon as the wallet is created. However, ensure the user doesn't close
the app until the storage of the user share is completed.

## Usage

First, deploy your app to a link (This repo is hosted [here](https://getpara.github.io/para-telegram-miniapp/))

Then, make a telegram bot [(See Telegram's Guide Here)](https://core.telegram.org/bots/tutorial) and point it to open
this link

## Try it out

<img width="422" alt="image" src="https://github.com/user-attachments/assets/7f34d3fa-b395-41e8-8828-53d467fa8a2e">

A Telegram mini-app linked to this app is [here](https://t.me/para_miniapp_bot)
