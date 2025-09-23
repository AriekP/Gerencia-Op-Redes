<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('back')"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ networkDevice.model }}</h1>
          <p class="text-gray-600">Detalles completos del dispositivo de red</p>
        </div>
      </div>
      <div class="flex space-x-3">
        <button
          @click="editMode = !editMode"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit class="w-4 h-4 mr-2 inline" />
          {{ editMode ? 'Cancelar' : 'Editar' }}
        </button>
        <button
          v-if="editMode"
          @click="saveNetworkDevice"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save class="w-4 h-4 mr-2 inline" />
          Guardar
        </button>
      </div>
    </div>
    
    <!-- Network Device Info Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Dispositivo</label>
              <select
                v-if="editMode"
                v-model="editableNetworkDevice.device_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="router">Router</option>
                <option value="switch">Switch</option>
                <option value="firewall">Firewall</option>
                <option value="access_point">Access Point</option>
                <option value="modem">Modem</option>
                <option value="cable">Cable</option>
                <option value="patch_panel">Patch Panel</option>
                <option value="server">Servidor</option>
              </select>
              <p v-else class="text-gray-900">{{ getDeviceTypeText(networkDevice.device_type) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.manufacturer"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.manufacturer }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.model"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.model }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.serial_number"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ networkDevice.serial_number }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.location"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.location || 'No especificada' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                v-if="editMode"
                v-model="editableNetworkDevice.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="maintenance">En Mantenimiento</option>
                <option value="inactive">Inactivo</option>
                <option value="retired">Retirado</option>
              </select>
              <span v-else :class="getStatusClass(networkDevice.status)">
                {{ getStatusText(networkDevice.status) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Purchase and Warranty Information -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información de Compra y Garantía</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.purchase_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ formatDate(networkDevice.purchase_date) }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin de Garantía</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.warranty_end_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ formatDate(networkDevice.warranty_end_date) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Assignment Information -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información de Asignación</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Persona Responsable</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.responsible_person"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.responsible_person || 'Sin asignar' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Última Revisión por</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.last_checked_by"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.last_checked_by || 'No revisado' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Última Revisión</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.last_checked_at"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ formatDateTime(networkDevice.last_checked_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Cable Information (for cable devices) -->
        <div v-if="networkDevice.device_type === 'cable'" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información de Cable</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Longitud Total (metros)</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.total_length_m"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.total_length_m }} m</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Longitud Usada (metros)</label>
              <input
                v-if="editMode"
                v-model="editableNetworkDevice.used_length_m"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p v-else class="text-gray-900">{{ networkDevice.used_length_m }} m</p>
            </div>
          </div>
        </div>
        
        <!-- Observations -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
          <textarea
            v-if="editMode"
            v-model="editableNetworkDevice.observations"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Agregar observaciones sobre el dispositivo..."
          ></textarea>
          <p v-else class="text-gray-900 whitespace-pre-wrap">{{ networkDevice.observations || 'Sin observaciones' }}</p>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Stats -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Días hasta fin de garantía:</span>
              <span :class="getDaysUntilWarrantyClass(networkDevice.warranty_end_date)">
                {{ getDaysUntilWarranty(networkDevice.warranty_end_date) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tiempo en inventario:</span>
              <span class="text-sm font-medium text-gray-900">
                {{ getTimeInInventory(networkDevice.purchase_date) }}
              </span>
            </div>
            <div v-if="networkDevice.device_type === 'cable'" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Cable disponible:</span>
              <span class="text-sm font-medium text-gray-900">
                {{ getAvailableCable(networkDevice.total_length_m, networkDevice.used_length_m) }} m
              </span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
          <div class="space-y-3">
            <button class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <FileText class="w-4 h-4 mr-2 inline" />
              Generar Reporte
            </button>
            <button class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Calendar class="w-4 h-4 mr-2 inline" />
              Programar Mantenimiento
            </button>
            <button class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Bell class="w-4 h-4 mr-2 inline" />
              Configurar Alertas
            </button>
          </div>
        </div>
        
        <!-- History -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Historial</h3>
          <div class="space-y-3">
            <div
              v-for="event in networkDevice.history"
              :key="event.id"
              class="flex items-start space-x-3"
            >
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ event.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(event.date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowLeft, Edit, Save, FileText, Calendar, Bell } from 'lucide-vue-next'

const props = defineProps({
  networkDevice: {
    type: Object,
    default: () => ({
      id: 1,
      device_type: 'switch',
      manufacturer: 'Cisco',
      model: 'Catalyst 2960',
      serial_number: 'CIS-2960-001',
      location: 'Sala de Servidores',
      status: 'active',
      purchase_date: '2023-01-15',
      warranty_end_date: '2025-01-15',
      responsible_person: 'Juan Pérez',
      last_checked_by: 'María García',
      last_checked_at: '2024-01-15T10:30:00',
      observations: 'Dispositivo funcionando correctamente. Revisión trimestral completada.',
      total_length_m: null,
      used_length_m: null,
      history: [
        { id: 1, description: 'Dispositivo agregado al inventario', date: '2023-01-15' },
        { id: 2, description: 'Asignado a Juan Pérez', date: '2023-01-16' },
        { id: 3, description: 'Mantenimiento preventivo realizado', date: '2023-06-01' }
      ]
    })
  }
})

const emit = defineEmits(['back', 'save'])

const editMode = ref(false)
const editableNetworkDevice = reactive({ ...props.networkDevice })

const getStatusClass = (status) => {
  const classes = {
    active: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    maintenance: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    inactive: 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
    retired: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return classes[status] || classes.active
}

const getStatusText = (status) => {
  const texts = {
    active: 'Activo',
    maintenance: 'En Mantenimiento',
    inactive: 'Inactivo',
    retired: 'Retirado'
  }
  return texts[status] || 'Activo'
}

const getDeviceTypeText = (type) => {
  const texts = {
    router: 'Router',
    switch: 'Switch',
    firewall: 'Firewall',
    access_point: 'Access Point',
    modem: 'Modem',
    cable: 'Cable',
    patch_panel: 'Patch Panel',
    server: 'Servidor'
  }
  return texts[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return 'No especificada'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'No revisado'
  return new Date(dateTimeString).toLocaleString('es-ES')
}

const getDaysUntilWarranty = (warrantyDate) => {
  if (!warrantyDate) return 'Sin garantía'
  const today = new Date()
  const warranty = new Date(warrantyDate)
  const diffTime = warranty - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Garantía vencida'
  if (diffDays === 0) return 'Hoy vence'
  return `${diffDays} días`
}

const getDaysUntilWarrantyClass = (warrantyDate) => {
  if (!warrantyDate) return 'text-gray-600 font-medium'
  const today = new Date()
  const warranty = new Date(warrantyDate)
  const diffTime = warranty - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600 font-medium'
  if (diffDays <= 30) return 'text-yellow-600 font-medium'
  return 'text-green-600 font-medium'
}

const getTimeInInventory = (purchaseDate) => {
  if (!purchaseDate) return 'No especificada'
  const today = new Date()
  const purchase = new Date(purchaseDate)
  const diffTime = today - purchase
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30))
  
  if (diffMonths < 1) return 'Menos de 1 mes'
  if (diffMonths < 12) return `${diffMonths} meses`
  
  const years = Math.floor(diffMonths / 12)
  const remainingMonths = diffMonths % 12
  
  if (remainingMonths === 0) return `${years} año${years > 1 ? 's' : ''}`
  return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
}

const getAvailableCable = (totalLength, usedLength) => {
  if (totalLength === null || usedLength === null) return 'N/A'
  return (totalLength - usedLength).toFixed(2)
}

const saveNetworkDevice = () => {
  emit('save', editableNetworkDevice)
  editMode.value = false
}
</script>