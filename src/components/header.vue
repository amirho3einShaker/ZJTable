<script setup>
import Filter from './filter.vue'
import Search from './search.vue'
import logo from '../../public/assets/logo.svg'

defineProps({
  data: Array,
  hiddenPaths: { type: Array, default: () => [] },
  showBack: { type: Boolean, default: false },
  showControls: { type: Boolean, default: false }
})

const emit = defineEmits(['filter-apply', 'search', 'search-fields', 'back'])

const GITHUB_URL = 'https://github.com/amirho3einShaker/ZJTable'
</script>

<template>
  <header class="shrink-0 border-b border-gray-100 bg-white">
    <div class="flex h-14 items-center gap-3 px-3">
      <button v-if="showBack" type="button" title="Return"
        class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        @click="emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <img :src="logo" alt="ZJTable" class="h-8 w-auto shrink-0" />

      <a :href="GITHUB_URL" target="_blank" rel="noreferrer" title="View on GitHub"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#000000" viewBox="0 0 16 16">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
        </svg>
      </a>

      <div v-if="showControls" class="flex flex-1 items-center justify-between gap-3">
        <Filter :data="data" @apply="v => emit('filter-apply', v)" />
        <Search :data="data" :hidden-paths="hiddenPaths" @search="p => emit('search', p)"
          @fields="v => emit('search-fields', v)" />
      </div>
      <div v-else class="flex-1"></div>

    </div>
  </header>
</template>