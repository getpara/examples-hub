import { createApp } from "vue";
import App from "./App.vue";
import { WagmiPlugin } from "@wagmi/vue";
import { wagmiConfig as config, queryClient } from "./client/wagmi";
import { VueQueryPlugin } from "@tanstack/vue-query";
import "react-dom/client";
import "./style.css";
import "@getpara/react-sdk/styles.css";

createApp(App).use(WagmiPlugin, { config }).use(VueQueryPlugin, { queryClient }).mount("#app");
