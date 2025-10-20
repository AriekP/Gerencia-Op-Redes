<template>
  <section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <!-- Zona de filtros / toolbar -->
    <header v-if="$slots.filters" class="p-4 border-b border-gray-200">
      <slot name="filters" />
    </header>

    <!-- Barra de scroll superior (sincronizada) -->
    <div
      ref="topScroller"
      class="h-4 overflow-x-auto overflow-y-hidden"
      @scroll="onTopScroll"
      style="scrollbar-width:auto;"
    >
      <!-- Spacer que replica el ancho del contenido real -->
      <div :style="{ width: contentWidth + 'px', height: '1px' }"></div>
    </div>

    <!-- Contenedor real con la tabla (scroll inferior) -->
    <div ref="realScroller" class="overflow-x-auto" @scroll="onRealScroll">
      <slot name="table" />
    </div>

    <!-- Paginación -->
    <footer v-if="$slots.pagination" class="p-3 border-t border-gray-200">
      <slot name="pagination" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const topScroller = ref<HTMLDivElement|null>(null)
const realScroller = ref<HTMLDivElement|null>(null)
const contentWidth = ref(1400)

let ro: ResizeObserver | null = null
let syncing = false

function measureContentWidth() {
  const scroller = realScroller.value
  if (!scroller) return
  // Busca el primer elemento que probablemente sea la tabla
  const inner = scroller.querySelector<HTMLElement>('table, .content-width, .min-w-[1400px]')
  const sw = inner ? inner.scrollWidth : scroller.scrollWidth
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

onMounted(async () => {
  await nextTick()
  measureContentWidth()
  const el = realScroller.value
  if (el) {
    ro = new ResizeObserver(() => measureContentWidth())
    ro.observe(el)
    const inner = el.querySelector<HTMLElement>('table, .content-width, .min-w-[1400px]')
    if (inner) ro.observe(inner)
  }
  // Recalcular al cambiar tamaño de ventana
  window.addEventListener('resize', measureContentWidth)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  window.removeEventListener('resize', measureContentWidth)
})
</script>
