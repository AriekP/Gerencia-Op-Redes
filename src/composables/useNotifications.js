import { ref, reactive } from 'vue'

const notifications = ref([])

let notificationId = 0

export function useNotifications() {
  const addNotification = (notification) => {
    const id = ++notificationId
    const newNotification = {
      id,
      visible: true,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after duration
    const duration = notification.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value[index].visible = false
      // Remove from array after animation
      setTimeout(() => {
        notifications.value.splice(index, 1)
      }, 300)
    }
  }

  const showError = (title, message, duration = 8000) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration
    })
  }

  const showSuccess = (title, message, duration = 4000) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  const showWarning = (title, message, duration = 6000) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  const showInfo = (title, message, duration = 5000) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  const clearAll = () => {
    notifications.value.forEach(n => n.visible = false)
    setTimeout(() => {
      notifications.value.splice(0)
    }, 300)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearAll
  }
}