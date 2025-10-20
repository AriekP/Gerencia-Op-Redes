<template>
  <div class="space-y-6">
    <!-- Header + botón -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Inventario del Area del Redes</h1>
        <p class="text-gray-600 mt-1">Gestiona todos los dispositivos de red de tu organización</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-4 h-4 mr-2 inline" />
        Agregar Dispositivo
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por modelo, fabricante, número de serie, responsable, ubicación..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <select v-model="filters.status" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="maintenance">En Mantenimiento</option>
            <option value="inactive">Inactivo</option>
            <option value="retired">Retirado</option>
          </select>
          <select v-model="filters.device_type" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todos los tipos</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="firewall">Firewall</option>
            <option value="access_point">Access Point</option>
            <option value="modem">Modem</option>
            <option value="cable">Cable</option>
            <option value="patch_panel">Patch Panel</option>
            <option value="server">Servidor</option>
          </select>
          <select v-model="filters.responsible_person" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todos los responsables</option>
            <option v-for="person in uniqueResponsiblePersons" :key="person" :value="person">{{ person }}</option>
          </select>
          <select v-model="filters.location" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todas las ubicaciones</option>
            <option v-for="loc in uniqueLocations" :key="loc" :value="loc">{{ loc }}</option>
          </select>
          <button @click="resetFilters" class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla + scroll superior sincronizado -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Scroll top falso -->
      <div
        ref="topScroller"
        class="h-4 overflow-x-auto overflow-y-hidden"
        @scroll="onTopScroll"
        style="scrollbar-width:auto;"
      >
        <div :style="{ width: contentWidth + 'px', height: '1px' }"></div>
      </div>

      <!-- Contenedor que scrollea realmente -->
      <div ref="realScroller" class="overflow-x-auto" @scroll="onRealScroll">
        <table class="min-w-[1400px] w-full border-separate divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Serie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Long. Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Long. Usada</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Compra</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin Garantía</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Revisión</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>

              <!-- HEADER sticky -->
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider
                       sticky right-0 z-20 bg-white shadow-[inset_1px_0_0_#e5e7eb]"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="device in filteredDevices" :key="device.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Package class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ device.model }}</div>
                    <div class="text-sm text-gray-500">{{ device.manufacturer }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{{ device.serial_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ getDeviceTypeText(device.device_type) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ device.manufacturer }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ device.responsible_person || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ device.location || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(device.status)">
                  {{ getStatusText(device.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.total_length_m ? `${device.total_length_m}m` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.used_length_m ? `${device.used_length_m}m` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(device.purchase_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(device.warranty_end_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDateTime(device.last_checked_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{{ device.observations }}</td>

              <!-- CELDA sticky -->
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium
                       sticky right-0 z-10 bg-white shadow-[inset_1px_0_0_#e5e7eb]"
              >
                <div class="flex items-center space-x-2 justify-end">
                  <button @click="viewDevice(device)" class="text-blue-600 hover:text-blue-900" title="Ver">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button @click="editDevice(device)" class="text-gray-600 hover:text-gray-900" title="Editar">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button @click="deleteDevice(device)" class="text-red-600 hover:text-red-900" title="Eliminar">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ showAddModal ? 'Agregar Dispositivo de Red' : 'Editar Dispositivo de Red' }}
        </h3>

        <form @submit.prevent="saveDevice" class="space-y-4 text-sm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Dispositivo *</label>
                <select v-model="currentDevice.device_type" required class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Seleccionar tipo</option>
                  <option value="router">Router</option>
                  <option value="switch">Switch</option>
                  <option value="firewall">Firewall</option>
                  <option value="access_point">Access Point</option>
                  <option value="modem">Modem</option>
                  <option value="cable">Cable</option>
                  <option value="patch_panel">Patch Panel</option>
                  <option value="server">Servidor</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fabricante *</label>
                <input v-model="currentDevice.manufacturer" type="text" required class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input v-model="currentDevice.model" type="text" required class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de Serie *</label>
                <input v-model="currentDevice.serial_number" type="text" required class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input v-model="currentDevice.location" type="text" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select v-model="currentDevice.status" required class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="active">Activo</option>
                  <option value="maintenance">En Mantenimiento</option>
                  <option value="inactive">Inactivo</option>
                  <option value="retired">Retirado</option>
                </select>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
                <input v-model="currentDevice.purchase_date" type="date" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin de Garantía</label>
                <input v-model="currentDevice.warranty_end_date" type="date" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Persona Responsable</label>
                <input v-model="currentDevice.responsible_person" type="text" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Última Revisión por</label>
                <input v-model="currentDevice.last_checked_by" type="text" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Última Revisión</label>
                <input v-model="currentDevice.last_checked_at" type="datetime-local" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitud Total (metros)</label>
                <input v-model="currentDevice.total_length_m" type="number" step="0.01" min="0" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitud Usada (metros)</label>
                <input v-model="currentDevice.used_length_m" type="number" step="0.01" min="0" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea v-model="currentDevice.observations" rows="3" class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Cancelar</button>
            <button type="submit" class="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              {{ showAddModal ? 'Agregar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-vue-next'
import { useNotifications } from '../composables/useNotifications.js'

const { showError, showSuccess, showWarning } = useNotifications()

const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const filters = ref({
  status: '',
  device_type: '',
  responsible_person: '',
  location: ''
})

const currentDevice = ref({
  device_type: '',
  manufacturer: '',
  model: '',
  serial_number: '',
  location: '',
  status: 'active',
  purchase_date: '',
  warranty_end_date: '',
  responsible_person: '',
  last_checked_by: '',
  last_checked_at: '',
  observations: '',
  total_length_m: null,
  used_length_m: null
})

const networkDevices = ref([])

/* ------------ Scroll superior sincronizado ------------ */
const topScroller = ref(null)
const realScroller = ref(null)
const contentWidth = ref(1400)
let ro = null
let syncing = false

function measureContentWidth() {
  const sc = realScroller.value
  if (!sc) return
  const inner = sc.querySelector('table')
  const sw = inner ? inner.scrollWidth : sc.scrollWidth
  contentWidth.value = sw
}
function onTopScroll() {
  if (syncing) return
  syncing = true
  if (topScroller.value && realScroller.value) {
    realScroller.value.scrollLeft = topScroller.value.scrollLeft
  }
  syncing = false
}
function onRealScroll() {
  if (syncing) return
  syncing = true
  if (topScroller.value && realScroller.value) {
    topScroller.value.scrollLeft = realScroller.value.scrollLeft
  }
  syncing = false
}
/* ------------------------------------------------------ */

// Helper rutas
const api = (p) => (p.startsWith('/') ? p : `/${p}`)

const loadDevices = async () => {
  try {
    const res = await fetch(api('/api/software'), { cache: 'no-store' })
    let json = null
    try {
      const text = await res.text()
      json = JSON.parse(text)
    } catch (e) {
      console.error('Error al parsear JSON:', e)
      return
    }

    if (res.ok) {
      const rows = (Array.isArray(json) ? json : json.data || []).map(item => ({
        id: item.id,
        device_type: item.device_type,
        manufacturer: item.manufacturer,
        model: item.model,
        serial_number: item.serial_number,
        location: item.location,
        status: item.status,
        purchase_date: item.purchase_date,
        warranty_end_date: item.warranty_end_date,
        responsible_person: item.responsible_person,
        last_checked_by: item.last_checked_by,
        last_checked_at: item.last_checked_at,
        observations: item.observations,
        total_length_m: item.total_length_m,
        used_length_m: item.used_length_m,
        created_at: item.created_at
      }))
      networkDevices.value = rows
      await nextTick()
      measureContentWidth()
    } else {
      console.error('Error cargando dispositivos:', json?.error)
      showError('Error al cargar datos', 'No se pudieron cargar los datos del inventario de red')
    }
  } catch (err) {
    console.error('Error fetch /api/software', err)
    showError('Error de conexión', 'No se pudo conectar con el servidor para cargar los datos')
  }
}

onMounted(async () => {
  await loadDevices()
  await nextTick()
  measureContentWidth()

  const el = realScroller.value
  if (el) {
    ro = new ResizeObserver(() => measureContentWidth())
    ro.observe(el)
    const inner = el.querySelector('table')
    if (inner) ro.observe(inner)
  }
  window.addEventListener('resize', measureContentWidth)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  window.removeEventListener('resize', measureContentWidth)
})

/* --------- Filtros y helpers --------- */
const uniqueResponsiblePersons = computed(() => {
  const persons = networkDevices.value
    .map(item => item.responsible_person)
    .filter(person => person && person.trim() !== '')
  return [...new Set(persons)].sort()
})

const uniqueLocations = computed(() => {
  const locations = networkDevices.value
    .map(item => item.location)
    .filter(location => location && location.trim() !== '')
  return [...new Set(locations)].sort()
})

const filteredDevices = computed(() => {
  let filtered = networkDevices.value

  if (searchQuery.value) {
    const s = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.model?.toLowerCase().includes(s) ||
      item.manufacturer?.toLowerCase().includes(s) ||
      item.serial_number?.toLowerCase().includes(s) ||
      item.responsible_person?.toLowerCase().includes(s) ||
      item.location?.toLowerCase().includes(s) ||
      item.observations?.toLowerCase().includes(s)
    )
  }
  if (filters.value.status) filtered = filtered.filter(i => i.status === filters.value.status)
  if (filters.value.device_type) filtered = filtered.filter(i => i.device_type === filters.value.device_type)
  if (filters.value.responsible_person) filtered = filtered.filter(i => i.responsible_person === filters.value.responsible_person)
  if (filters.value.location) filtered = filtered.filter(i => i.location === filters.value.location)

  return filtered
})

const getStatusClass = (status) => {
  const classes = {
    active: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    maintenance: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    inactive: 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
    retired: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return classes[status] || classes.active
}
const getStatusText = (status) => ({
  active: 'Activo',
  maintenance: 'Mantenimiento',
  inactive: 'Inactivo',
  retired: 'Retirado'
}[status] || 'Activo')

const getDeviceTypeText = (type) => ({
  router: 'Router',
  switch: 'Switch',
  firewall: 'Firewall',
  access_point: 'Access Point',
  modem: 'Modem',
  cable: 'Cable',
  patch_panel: 'Patch Panel',
  server: 'Servidor'
}[type] || type)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '-'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('es-ES') : '-'

const resetFilters = () => {
  filters.value = { status: '', device_type: '', responsible_person: '', location: '' }
  searchQuery.value = ''
}

const viewDevice = (item) => { console.log('View device:', item) }

const editDevice = (item) => {
  currentDevice.value = {
    id: item.id,
    device_type: item.device_type,
    manufacturer: item.manufacturer,
    model: item.model,
    serial_number: item.serial_number,
    location: item.location,
    status: item.status,
    purchase_date: item.purchase_date,
    warranty_end_date: item.warranty_end_date,
    responsible_person: item.responsible_person,
    last_checked_by: item.last_checked_by,
    last_checked_at: item.last_checked_at ? String(item.last_checked_at).replace(' ', 'T').substring(0, 16) : '',
    observations: item.observations,
    total_length_m: item.total_length_m,
    used_length_m: item.used_length_m
  }
  showEditModal.value = true
}

const deleteDevice = async (item) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar "${item.model}"?`)) return
  try {
    const res = await fetch(api(`/api/software/${item.id}`), { method: 'DELETE', cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) {
      console.error('Error deleting', json)
      if (res.status === 404) showError('Dispositivo no encontrado', 'El dispositivo que intentas eliminar ya no existe')
      else showError('Error al eliminar', json.error || 'No se pudo eliminar el dispositivo')
      return
    }
    showSuccess('Dispositivo eliminado', `"${item.model}" ha sido eliminado exitosamente`)
    await loadDevices()
  } catch (err) {
    console.error('Error deleting', err)
    showError('Error de conexión', 'No se pudo conectar con el servidor para eliminar el dispositivo')
  }
}

const saveDevice = async () => {
  try {
    if (!currentDevice.value.model || !currentDevice.value.manufacturer || !currentDevice.value.serial_number) {
      showWarning('Campos obligatorios', 'El modelo, fabricante y número de serie son obligatorios')
      return
    }

    if (showAddModal.value) {
      const existingSerial = networkDevices.value.find(d =>
        (d.serial_number || '').toLowerCase() === (currentDevice.value.serial_number || '').toLowerCase()
      )
      if (existingSerial) {
        showError('Número de serie duplicado', `Ya existe un dispositivo con el número de serie "${currentDevice.value.serial_number}".`)
        return
      }
    }

    const headers = { 'Content-Type': 'application/json' }
    const payload = {
      device_type: currentDevice.value.device_type,
      manufacturer: currentDevice.value.manufacturer,
      model: currentDevice.value.model,
      serial_number: currentDevice.value.serial_number,
      location: currentDevice.value.location,
      status: currentDevice.value.status,
      purchase_date: currentDevice.value.purchase_date,
      warranty_end_date: currentDevice.value.warranty_end_date,
      responsible_person: currentDevice.value.responsible_person,
      last_checked_by: currentDevice.value.last_checked_by,
      last_checked_at: currentDevice.value.last_checked_at,
      observations: currentDevice.value.observations,
      total_length_m: currentDevice.value.total_length_m ? parseFloat(currentDevice.value.total_length_m) : null,
      used_length_m: currentDevice.value.used_length_m ? parseFloat(currentDevice.value.used_length_m) : null
    }

    if (showAddModal.value) {
      const res = await fetch(api('/api/software'), { method: 'POST', headers, body: JSON.stringify(payload), cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        console.error('Error creating', json)
        if (json.type === 'duplicate_serial_number') showError('Número de serie duplicado', json.error)
        else if (res.status === 400) showError('Datos incompletos', json.error || 'Completa los campos obligatorios')
        else showError('Error al crear dispositivo', json.error || 'Ocurrió un error inesperado')
        return
      }
      showSuccess('Dispositivo creado', 'El dispositivo se ha creado exitosamente')
    } else {
      const res = await fetch(api(`/api/software/${currentDevice.value.id}`), { method: 'PUT', headers, body: JSON.stringify(payload), cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        console.error('Error updating', json)
        if (json.type === 'duplicate_serial_number') showError('Número de serie duplicado', json.error)
        else if (res.status === 400) showError('Datos incompletos', json.error || 'Completa los campos obligatorios')
        else showError('Error al actualizar dispositivo', json.error || 'Ocurrió un error inesperado')
        return
      }
      showSuccess('Dispositivo actualizado', 'Los datos se han actualizado exitosamente')
    }

    await loadDevices()
    closeModal()
  } catch (err) {
    console.error('Error saving', err)
    showError('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  currentDevice.value = {
    device_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    status: 'active',
    purchase_date: '',
    warranty_end_date: '',
    responsible_person: '',
    last_checked_by: '',
    last_checked_at: '',
    observations: '',
    total_length_m: null,
    used_length_m: null
  }
}
</script>
