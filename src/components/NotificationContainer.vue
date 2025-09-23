<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <NotificationToast
      v-for="notification in notifications"
      :key="notification.id"
      :visible="notification.visible"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import NotificationToast from './NotificationToast.vue'
import { useNotifications } from '../composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>