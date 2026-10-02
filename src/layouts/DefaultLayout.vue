<script setup>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'

defineProps({
  data: Array,
  hiddenPaths: { type: Array, default: () => [] },
  showBack: { type: Boolean, default: false },
  showControls: { type: Boolean, default: false }
})

const emit = defineEmits(['filter-apply', 'search', 'search-fields', 'back', 'close'])
</script>

<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden bg-white">
    <Header
      :data="data"
      :hidden-paths="hiddenPaths"
      :show-back="showBack"
      :show-controls="showControls"
      @filter-apply="v => emit('filter-apply', v)"
      @search="p => emit('search', p)"
      @search-fields="v => emit('search-fields', v)"
      @back="emit('back')"
      @close="emit('close')"
    />

    <main class="flex min-h-0 flex-1 flex-col">
      <slot />
    </main>

    <Footer />
  </div>
</template>