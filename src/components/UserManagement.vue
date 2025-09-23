<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600 mt-1">Administra usuarios y sus roles en el sistema</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <UserPlus class="w-4 h-4 mr-2 inline" />
        Agregar Usuario
      </button>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar usuarios..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-3">
          <select
            v-model="roleFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-semibold text-lg">
                {{ user.name.charAt(0) }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ user.name }}</h3>
              <p class="text-sm text-gray-600">{{ user.email }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="editUser(user)"
              class="text-gray-600 hover:text-gray-900"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              @click="deleteUser(user)"
              class="text-red-600 hover:text-red-900"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Rol:</span>
            <span :class="getRoleClass(user.role)">
              {{ getRoleText(user.role) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Estado:</span>
            <span :class="user.active ? 'text-green-600' : 'text-red-600'">
              {{ user.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Último acceso:</span>
            <span class="text-sm text-gray-900">{{ formatDate(user.lastLogin) }}</span>
          </div>
          
          <div class="pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Software asignado:</span>
              <span class="text-sm font-medium text-gray-900">{{ user.assignedSoftware }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ showAddModal ? 'Agregar Usuario' : 'Editar Usuario' }}
        </h3>
        
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              v-model="currentUser.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="currentUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div v-if="showAddModal">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="currentUser.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              v-model="currentUser.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input
              v-model="currentUser.department"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="flex items-center">
            <input
              v-model="currentUser.active"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 text-sm text-gray-700">Usuario activo</label>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ showAddModal ? 'Agregar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UserPlus, Search, Edit, Trash2 } from 'lucide-vue-next'

const searchQuery = ref('')
const roleFilter = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const currentUser = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  role: '',
  department: '',
  active: true,
  lastLogin: null,
  assignedSoftware: 0
})

const users = ref([])

// Load users from backend
const API_BASE = window.location.origin

const loadUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) {
      console.error('Error loading users', json)
      return
    }
    users.value = (json.data || []).map(u => ({
      ...u,
      lastLogin: u.lastLogin || u.last_login || null
    }))
  } catch (err) {
    console.error('Error fetching /api/users', err)
  }
}

loadUsers()

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

const getRoleClass = (role) => {
  const classes = {
    admin: 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
    user: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    viewer: 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
  }
  return classes[role] || classes.user
}

const getRoleText = (role) => {
  const texts = {
    admin: 'Administrador',
    user: 'Usuario',
    viewer: 'Visualizador'
  }
  return texts[role] || 'Usuario'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const editUser = (user) => {
  currentUser.value = { ...user, password: '' }
  showEditModal.value = true
  showAddModal.value = false
}

const deleteUser = async (user) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return
  try {
    const res = await fetch(`${API_BASE}/api/users/${user.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json()
      console.error('Error deleting user', body)
      return
    }
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx > -1) users.value.splice(idx, 1)
  } catch (err) {
    console.error('Error deleting user', err)
  }
}

const saveUser = async () => {
  try {
    // Basic client-side validation
    if (!currentUser.value.email) {
      console.error('Email es requerido')
      return
    }
    if (showAddModal.value && !currentUser.value.password) {
      console.error('Password es requerido para crear usuarios')
      return
    }
    if (!currentUser.value.role) {
      console.error('Rol es requerido')
      return
    }

    const headers = { 'Content-Type': 'application/json' }

    if (showAddModal.value) {
      const payload = {
        email: currentUser.value.email,
        password: currentUser.value.password,
        name: currentUser.value.name,
        role: currentUser.value.role,
        department: currentUser.value.department,
        active: currentUser.value.active
      }
      const res = await fetch(`${API_BASE}/api/users`, { method: 'POST', headers, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) {
        console.error('Error creating user', json)
      } else {
        users.value.push({ ...json.data, lastLogin: null, assignedSoftware: 0 })
      }
    } else {
      const payload = {
        email: currentUser.value.email,
        password: currentUser.value.password || undefined,
        name: currentUser.value.name,
        role: currentUser.value.role,
        department: currentUser.value.department,
        active: currentUser.value.active
      }
      const res = await fetch(`${API_BASE}/api/users/${currentUser.value.id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) {
        console.error('Error updating user', json)
      } else {
        const idx = users.value.findIndex(u => u.id === currentUser.value.id)
        if (idx > -1) users.value[idx] = { ...users.value[idx], ...json.data }
      }
    }
  } catch (err) {
    console.error('Error saving user', err)
  } finally {
    closeModal()
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  currentUser.value = { id: null, name: '', email: '', role: '', department: '', active: true, lastLogin: null, assignedSoftware: 0 }
}
</script>