<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard de Inventario</h1>
        <p class="text-gray-600 mt-1">Control en tiempo real de tu Inventario del Area del Redes</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4 mr-2 inline', loading ? 'animate-spin' : '']" />
          Actualizar
        </button>
        <button 
          @click="$router.push('/inventory')"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus class="w-4 h-4 mr-2 inline" />
          Añadir software
        </button>
      </div>
    </div>
    
    <div v-if="loading && !hasData" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Cargando datos...</span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in statsData"
        :key="stat.title"
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
          </div>
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" :class="['w-6 h-6', stat.iconColor]" />
          </div>
        </div>
        <div class="mt-4 flex items-center" v-if="stat.subtitle">
          <span class="text-sm text-gray-500">{{ stat.subtitle }}</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="!loading || hasData">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Estado del Software</h3>
        <div class="h-64 flex items-center justify-center">
          <div class="text-center">
            <div class="w-32 h-32 mx-auto mb-4 relative">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="3"
                  :stroke-dasharray="`${activePercentage}, 100`"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="3"
                  :stroke-dasharray="`${expiredPercentage}, 100`"
                  :stroke-dashoffset="`-${activePercentage}`"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  stroke-width="3"
                  :stroke-dasharray="`${expiringPercentage}, 100`"
                  :stroke-dashoffset="`-${activePercentage + expiredPercentage}`"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-900">{{ totalSoftware }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-center space-x-4">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">Activos ({{ activeSoftware }})</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">Vencidos ({{ expiredSoftware }})</span>
                </div>
              </div>
              <div class="flex items-center justify-center">
                <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span class="text-sm text-gray-600">Por vencer ({{ expiringSoftware }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Software por Departamento</h3>
        <div class="space-y-4">
          <div v-for="dept in departmentStats" :key="dept.name" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded bg-blue-500 mr-3"></div>
              <span class="text-sm text-gray-700">{{ dept.name || 'Sin asignar' }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(dept.count / totalSoftware) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-8">{{ dept.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="!loading || hasData">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Software Reciente</h3>
          <button 
            @click="$router.push('/inventory')"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todo
          </button>
        </div>
        <div class="space-y-4">
          <div v-if="recentSoftware.length === 0" class="text-center py-4">
            <Package class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No hay software registrado</p>
          </div>
          <div
            v-else
            v-for="software in recentSoftware"
            :key="software.id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package class="w-5 h-5 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ software.name }}</p>
              <p class="text-xs text-gray-500">{{ software.responsible || 'Sin asignar' }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(software.createdAt) }}</p>
            </div>
            <span :class="getStatusBadge(software.status)">
              {{ getStatusText(software.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div class="space-y-3">
          <button
            @click="$router.push('/inventory')"
            class="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Plus class="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <h4 class="font-medium text-gray-900">Agregar Software</h4>
              <p class="text-sm text-gray-600">Registra nuevo software en el inventario</p>
            </div>
          </button>
          
          <button
            @click="$router.push('/reports')"
            class="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <FileText class="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h4 class="font-medium text-gray-900">Generar Reporte</h4>
              <p class="text-sm text-gray-600">Crea reportes de licencias y uso</p>
            </div>
          </button>
          
          <button
            @click="$router.push('/users')"
            class="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Users class="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <h4 class="font-medium text-gray-900">Gestionar Usuarios</h4>
              <p class="text-sm text-gray-600">Administra usuarios y permisos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, Plus, Package, AlertTriangle, Users, FileText, CheckCircle, Clock } from 'lucide-vue-next'

// Reactive state
const loading = ref(true)
const hasData = ref(false)
const softwareData = ref([])
const usersData = ref([])
const refreshInterval = ref(null)

// API configuration
const API_BASE = 'http://localhost:3000'

// Computed properties for stats
const totalSoftware = computed(() => softwareData.value.length)

const activeSoftware = computed(() => 
  softwareData.value.filter(s => s.status === 'active').length
)

const expiredSoftware = computed(() => 
  softwareData.value.filter(s => s.status === 'expired').length
)

const expiringSoftware = computed(() => 
  softwareData.value.filter(s => s.status === 'expiring').length
)

const totalUsers = computed(() => usersData.value.length)

// Computed properties for chart percentages
const activePercentage = computed(() => 
  totalSoftware.value > 0 ? (activeSoftware.value / totalSoftware.value) * 100 : 0
)

const expiredPercentage = computed(() => 
  totalSoftware.value > 0 ? (expiredSoftware.value / totalSoftware.value) * 100 : 0
)

const expiringPercentage = computed(() => 
  totalSoftware.value > 0 ? (expiringSoftware.value / totalSoftware.value) * 100 : 0
)

// Stats data for cards
const statsData = computed(() => [
  {
    title: 'Total Productos',
    value: totalSoftware.value.toString(),
    subtitle: 'Licencias registradas',
    icon: Package,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Activos',
    value: activeSoftware.value.toString(),
    subtitle: 'Software funcionando',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Por vencer',
    value: expiringSoftware.value.toString(),
    subtitle: 'Requieren atención',
    icon: Clock,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    title: 'Total Usuarios',
    value: totalUsers.value.toString(),
    subtitle: 'Usuarios registrados',
    icon: Users,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
])

// Department statistics
const departmentStats = computed(() => {
  const deptCounts = {}
  
  softwareData.value.forEach(software => {
    const dept = software.department || 'Sin asignar'
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  })
  
  return Object.entries(deptCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) // Top 6 departments
})

// Recent software (last 5 added)
const recentSoftware = computed(() => {
  return [...softwareData.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

const getStatusText = (status) => {
  const texts = {
    active: 'Activo',
    expired: 'Vencido',
    expiring: 'Por vencer'
  }
  return texts[status] || 'Desconocido'
}

const getStatusBadge = (status) => {
  const classes = {
    active: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    expired: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    expiring: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
}

// API functions
const loadSoftware = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/software`, { cache: 'no-store' })
    
    let json = null
    try {
      const text = await res.text()
      json = JSON.parse(text)
    } catch (e) {
      console.error('Error parsing software JSON:', e)
      return
    }
    
    if (res.ok) {
      const backendToStatus = {
        activo: 'active',
        expirado: 'expired',
        en_revision: 'expiring',
        inactivo: 'inactive'
      }
      
      const rows = (Array.isArray(json) ? json : json.data || []).map(item => ({
        ...item,
        id: item.id,
        name: item.name || '',
        serial: item.serial || item.serial_number || '',
        responsible: item.responsible || '',
        responsibleUserId: item.responsible_user_id || item.responsibleUserId || '',
        status: backendToStatus[item.status] || item.status || 'active',
        expiryDate: item.expiryDate || item.expiry_date || '',
        warrantyExpiration: item.warranty_expiration || '',
        notes: item.notes || '',
        createdAt: item.created_at || item.createdAt || '',
        department: item.department || '',
        vendor: item.vendor || '',
        licenseType: item.license_type || ''
      }))
      
      softwareData.value = rows
    } else {
      console.error('Error loading software:', json.error)
    }
  } catch (err) {
    console.error('Error fetch /api/software', err)
  }
}

const loadUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' })
    const json = await res.json()
    
    if (res.ok) {
      usersData.value = (json.data || []).map(u => ({ 
        id: u.id, 
        name: u.name || u.email,
        email: u.email
      }))
    } else {
      console.warn('Could not load users for dashboard stats')
    }
  } catch (e) {
    console.warn('Error fetching users for dashboard', e)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([loadSoftware(), loadUsers()])
    hasData.value = true
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    loading.value = false
  }
}

// Auto-refresh functionality
const startAutoRefresh = () => {
  // Refresh every 5 minutes
  refreshInterval.value = setInterval(refreshData, 5 * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>