<template>
  <div id="app" class="iframe-frame min-h-screen bg-neutral flex flex-col">
    <header class="bg-primary shadow-sm border-b border-secondary">
      <!-- Título superior -->
      <div class="px-6 py-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-light">{{ currentViewTitle }}</h1>
        <div class="flex items-center space-x-4"></div>
      </div>

      <!-- ===== Banner centrado con fondo ===== -->
      <div class="hero-banner">
        <h2 class="hero-title">Departamento de Redes</h2>
      </div>
      <!-- ===================================== -->

      <!-- NavBar -->
      <nav class="bg-primary border-t border-secondary">
        <div class="px-6 flex items-center justify-center space-x-3 py-2">
          <!-- Botones existentes -->
          <button
            v-for="item in navigation"
            :key="item.name"
            @click="currentView = item.view"
            :class="[
              'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentView === item.view
                ? 'bg-secondary text-light border-b-2 border-accent'
                : 'text-light hover:bg-secondary hover:text-light opacity-80'
            ]"
          >
            <component :is="item.icon" class="mr-2 h-5 w-5" />
            {{ item.name }}
          </button>

          <!-- Separador opcional -->
          <span class="nav-divider hidden sm:inline-block"></span>

          <!-- ===== Botón IDEF0 al lado de “Inventario” ===== -->
          <a
            href="http://m4celch.neocities.org"
            target="_blank"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-neutral font-semibold hover:opacity-90 transition"
          >
            IDEF0
          </a>

          <span class="nav-divider hidden sm:inline-block"></span>

          <!-- ===== Botón IDEF0 al lado de “Inventario” ===== -->
          <a
            href="https://bpmnredes.netlify.app/"
            target="_blank"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-neutral font-semibold hover:opacity-90 transition"
          >
            BPMN
          </a>
          
        </div>
      </nav>
    </header>

    <main class="flex-1 p-6 bg-neutral">
      <component :is="currentComponent" />
    </main>

    <NotificationContainer />
  </div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { BarChart3, Package /*, Users, FileText*/ } from 'lucide-vue-next'
import NotificationContainer from './components/NotificationContainer.vue'
import Dashboard from './components/Dashboard.vue'
import SoftwareInventory from './components/SoftwareInventory.vue'
import UserManagement from './components/UserManagement.vue'
import Reports from './components/Reports.vue'

const currentView = ref('dashboard')

const navigation = [
  { name: 'Dashboard', view: 'dashboard', icon: BarChart3 },
  { name: 'Inventario', view: 'inventory', icon: Package },
  // { name: 'Usuarios', view: 'users', icon: Users },
  // { name: 'Reportes', view: 'reports', icon: FileText },
]

const currentComponent = computed(() => {
  const components = {
    dashboard: Dashboard,
    inventory: SoftwareInventory,
    users: UserManagement,
    reports: Reports
  }
  return components[currentView.value]
})

const currentViewTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    inventory: 'Inventario del Área de Redes',
    users: 'Gestión de Usuarios',
    reports: 'Reportes'
  }
  return titles[currentView.value]
})
</script>
