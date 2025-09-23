<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-sm text-gray-600 mt-1">Genera y exporta reportes detallados del Inventario del Area del Redes</p>
      </div>
    </div>

    <!-- Report Types -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('inventory')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'inventory' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'inventory' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Inventario General</h3>
        <p class="text-sm text-gray-600">Reporte completo de todos los softwares, licencias y estados</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('licenses')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'licenses' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'licenses' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Estado de Licencias</h3>
        <p class="text-sm text-gray-600">Análisis de licencias activas, vencidas y próximas a vencer</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('users')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'users' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'users' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Asignación por Usuario</h3>
        <p class="text-sm text-gray-600">Softwares asignados por usuario y departamento</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('costs')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'costs' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'costs' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Análisis de Costos</h3>
        <p class="text-sm text-gray-600">Costos totales, por departamento y proyecciones</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('compliance')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'compliance' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'compliance' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Cumplimiento</h3>
        <p class="text-sm text-gray-600">Estado de cumplimiento y auditoría de licencias</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" @click="selectReportType('usage')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <span :class="selectedReport === 'usage' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs font-semibold rounded-full">
            {{ selectedReport === 'usage' ? 'Seleccionado' : 'Disponible' }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Análisis de Uso</h3>
        <p class="text-sm text-gray-600">Estadísticas de uso y optimización de licencias</p>
      </div>
    </div>

    <!-- Report Configuration -->
    <div v-if="selectedReport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Configuración del Reporte</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Filters -->
        <div class="lg:col-span-2">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Filtros</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</label>
              <select v-model="reportConfig.dateRange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todas las fechas</option>
                <option value="last30">Últimos 30 días</option>
                <option value="last90">Últimos 90 días</option>
                <option value="thisYear">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="reportConfig.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="expired">Vencido</option>
                <option value="expiring">Por vencer</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <select v-model="reportConfig.department" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todos los departamentos</option>
                <option value="IT">Tecnología</option>
                <option value="HR">Recursos Humanos</option>
                <option value="Finance">Finanzas</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operaciones</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <select v-model="reportConfig.responsible" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todos los responsables</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="María García">María García</option>
                <option value="Carlos López">Carlos López</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Export Options -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Opciones de Exportación</h3>
          <div class="space-y-3">
            <label class="flex items-center">
              <input v-model="reportConfig.includeCharts" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="ml-2 text-sm text-gray-700">Incluir gráficos</span>
            </label>
            <label class="flex items-center">
              <input v-model="reportConfig.includeDetails" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="ml-2 text-sm text-gray-700">Incluir detalles completos</span>
            </label>
            <label class="flex items-center">
              <input v-model="reportConfig.includeSummary" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="ml-2 text-sm text-gray-700">Incluir resumen ejecutivo</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Preview -->
    <div v-if="selectedReport" class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Vista Previa del Reporte</h2>
        <div class="flex items-center space-x-3">
          <button @click="generateReport" :disabled="generating" class="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <svg v-if="generating" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ generating ? 'Generando...' : 'Generar Reporte' }}
          </button>
          
          <div class="flex items-center space-x-2">
            <button @click="exportToPDF" :disabled="!reportGenerated" class="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              PDF
            </button>
            
            <button @click="exportToCSV" :disabled="!reportGenerated" class="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <div v-if="!reportGenerated" class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500">Haz clic en "Generar Reporte" para ver la vista previa</p>
        </div>
        
        <div v-else>
          <!-- Report Summary -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ getReportTitle() }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <p class="text-sm font-medium text-blue-600">Total de Registros</p>
                <p class="text-2xl font-bold text-blue-900">{{ reportData.totalRecords }}</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <p class="text-sm font-medium text-green-600">Activos</p>
                <p class="text-2xl font-bold text-green-900">{{ reportData.activeCount }}</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <p class="text-sm font-medium text-yellow-600">Por Vencer</p>
                <p class="text-2xl font-bold text-yellow-900">{{ reportData.expiringCount }}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-4">
                <p class="text-sm font-medium text-red-600">Vencidos</p>
                <p class="text-2xl font-bold text-red-900">{{ reportData.expiredCount }}</p>
              </div>
            </div>
          </div>
          
          <!-- Sample Data Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Software</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in reportData.sampleData" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.version }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.responsible }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(item.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusText(item.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.expiration }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
      </div>
      
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="report in recentReports" :key="report.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ report.name }}</p>
                <p class="text-xs text-gray-500">{{ report.date }} - {{ report.records }} registros</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </button>
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const selectedReport = ref('')
const generating = ref(false)
const reportGenerated = ref(false)

const reportConfig = reactive({
  dateRange: 'all',
  status: 'all',
  department: 'all',
  responsible: 'all',
  includeCharts: true,
  includeDetails: true,
  includeSummary: true
})

const reportData = reactive({
  totalRecords: 0,
  activeCount: 0,
  expiringCount: 0,
  expiredCount: 0,
  sampleData: []
})

const recentReports = ref([
  {
    id: 1,
    name: 'Inventario General - Diciembre 2024',
    date: '10/12/2024',
    records: 24,
    type: 'inventory'
  },
  {
    id: 2,
    name: 'Estado de Licencias - Noviembre 2024',
    date: '05/11/2024',
    records: 18,
    type: 'licenses'
  },
  {
    id: 3,
    name: 'Análisis de Costos - Q4 2024',
    date: '01/11/2024',
    records: 24,
    type: 'costs'
  }
])

const selectReportType = (type) => {
  selectedReport.value = type
  reportGenerated.value = false
}

const generateReport = async () => {
  generating.value = true
  
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock data based on report type
  const mockData = {
    inventory: {
      totalRecords: 24,
      activeCount: 18,
      expiringCount: 4,
      expiredCount: 2,
      sampleData: [
        { id: 1, name: 'Microsoft Office 365', version: '2024', responsible: 'Juan Pérez', status: 'active', expiration: '15/01/2025' },
        { id: 2, name: 'Adobe Creative Suite', version: '2024', responsible: 'María García', status: 'active', expiration: '20/03/2025' },
        { id: 3, name: 'AutoCAD', version: '2023', responsible: 'Carlos López', status: 'expiring', expiration: '15/01/2025' },
        { id: 4, name: 'Antivirus Norton', version: '2023', responsible: 'Juan Pérez', status: 'expired', expiration: '01/12/2024' }
      ]
    },
    licenses: {
      totalRecords: 24,
      activeCount: 18,
      expiringCount: 4,
      expiredCount: 2,
      sampleData: [
        { id: 1, name: 'Microsoft Office 365', version: '2024', responsible: 'Juan Pérez', status: 'active', expiration: '15/01/2025' },
        { id: 2, name: 'Adobe Creative Suite', version: '2024', responsible: 'María García', status: 'active', expiration: '20/03/2025' }
      ]
    }
  }
  
  const data = mockData[selectedReport.value] || mockData.inventory
  Object.assign(reportData, data)
  
  generating.value = false
  reportGenerated.value = true
}

const exportToPDF = () => {
  // Simulate PDF export
  const link = document.createElement('a')
  link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFJlcG9ydGUgZGUgSW52ZW50YXJpbyBkZSBTb2Z0d2FyZSkKL0NyZWF0b3IgKFNvZnR3YXJlIEludmVudG9yeSBTeXN0ZW0pCi9Qcm9kdWNlciAoU29mdHdhcmUgSW52ZW50b3J5IFN5c3RlbSkKL0NyZWF0aW9uRGF0ZSAoRDoyMDI0MTIxNTEyMDAwMFopCj4+CmVuZG9iago='
  link.download = `reporte-${selectedReport.value}-${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
  
  alert('Reporte PDF descargado exitosamente')
}

const exportToCSV = () => {
  // Generate CSV content
  const headers = ['Software', 'Versión', 'Responsable', 'Estado', 'Vencimiento']
  const csvContent = [
    headers.join(','),
    ...reportData.sampleData.map(item => 
      [item.name, item.version, item.responsible, item.status, item.expiration].join(',')
    )
  ].join('\n')
  
  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `reporte-${selectedReport.value}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  alert('Reporte CSV descargado exitosamente')
}

const getReportTitle = () => {
  const titles = {
    inventory: 'Reporte de Inventario General',
    licenses: 'Reporte de Estado de Licencias',
    users: 'Reporte de Asignación por Usuario',
    costs: 'Reporte de Análisis de Costos',
    compliance: 'Reporte de Cumplimiento',
    usage: 'Reporte de Análisis de Uso'
  }
  return titles[selectedReport.value] || 'Reporte'
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    expiring: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Activo',
    expired: 'Vencido',
    expiring: 'Por vencer'
  }
  return texts[status] || 'Desconocido'
}
</script>
