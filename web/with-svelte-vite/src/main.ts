import { mount } from "svelte";
import "@/styles/globals.css";
import App from "@/app/App.svelte";

mount(App, { target: document.getElementById("app")! });
