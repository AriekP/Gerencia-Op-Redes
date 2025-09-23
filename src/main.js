import { createApp } from 'vue'
import App from './App.vue'
import './main.css'

// The application is now public; all Supabase logic is removed.
// We are not using Supabase or any other backend for authentication.

// This line creates and mounts the Vue application directly.
createApp(App).mount('#app')