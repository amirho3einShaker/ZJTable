<script setup>
import { ref, computed } from 'vue'
import Table from '../components/table.vue'
import '../assets/css/home.css'

defineProps({
  screen: String,
  json: [Array, Object, null],
  hiddenPaths: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  searchFields: { type: Array, default: () => [] },
  noResults: { type: Boolean, default: false },
  resultCount: { type: Number, default: 0 },
  captured: { type: Array, default: () => [] },
  loadingCaptured: { type: Boolean, default: false }
})

const emit = defineEmits(['open-table', 'capture-page', 'pick-captured', 'results'])

const isExtension = computed(() => {
  try {
    return (
      typeof chrome !== 'undefined' &&
      !!chrome?.tabs &&
      !!chrome?.scripting
    )
  } catch {
    return false
  }
})

const showPasteModal = ref(false)
const pasteText = ref('')

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      emit('open-table', JSON.parse(reader.result))
    } catch {
      alert('The selected file is not valid JSON')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function openPasteModal() {
  pasteText.value = ''
  showPasteModal.value = true
}

function closePasteModal() {
  showPasteModal.value = false
  pasteText.value = ''
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    pasteText.value = text
  } catch (err) {
    console.error(err)
    alert('Could not read clipboard. Please paste manually (Ctrl+V) inside the textarea.')
  }
}

function confirmPaste() {
  const raw = pasteText.value.trim()
  if (!raw) {
    alert('Please paste JSON content first.')
    return
  }
  try {
    const data = JSON.parse(raw)
    closePasteModal()
    emit('open-table', data)
  } catch {
    alert('The pasted content is not valid JSON')
  }
}
</script>

<template>
  <!-- Home -->
  <div v-if="screen === 'home'" class="flex flex-1 items-center justify-center bg-gray-50">
    <div class="excel-home__card">
      <div class="excel-home__titlebar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          class="excel-home__icon">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
        <span>Zenit Json Table</span>
      </div>
      <div class="excel-home__body">
        <button v-if="isExtension" class="excel-btn excel-btn--primary" :disabled="loadingCaptured"
          @click="emit('capture-page')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" class="excel-btn__icon">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="m20 20-3.5-3.5" />
          </svg>
          {{ loadingCaptured ? 'Scanning page...' : 'Show JSON of This Page' }}
        </button>
        <label class="excel-btn excel-btn--secondary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" class="excel-btn__icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
          </svg>
          Upload JSON File
          <input type="file" accept="application/json,.json" class="hidden" @change="onFileChange" />
        </label>
        <button class="excel-btn excel-btn--secondary" @click="openPasteModal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" class="excel-btn__icon">
            <rect x="8" y="3" width="10" height="4" rx="1" />
            <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
          </svg>
          Paste JSON from Clipboard
        </button>
      </div>
      <div class="excel-home__grid">
        <span v-for="col in ['A', 'B', 'C', 'D', 'E', 'F']" :key="col">{{ col }}</span>
      </div>
    </div>
  </div>

  <!-- Multiple sources -->
  <div v-else-if="screen === 'pick'" class="flex flex-1 flex-col gap-2 overflow-auto bg-white p-4">
    <p class="mb-2 text-sm text-gray-600">
      {{ captured.length }} JSON sources found. Pick one:
    </p>
    <button v-for="(item, i) in captured" :key="i"
      class="rounded-md border border-gray-200 px-3 py-2 text-left text-xs hover:bg-gray-50"
      @click="emit('pick-captured', item)">
      <div class="font-medium text-gray-700">{{ item.source }}</div>
      <div class="truncate text-gray-400">{{ item.url }}</div>
    </button>
  </div>

  <!-- Table view -->
  <div v-else class="flex flex-1 flex-col overflow-hidden bg-white">
    <div class="flex flex-1 flex-col overflow-hidden p-3">
      <div v-if="searchQuery && resultCount > 0"
        class="mb-2 inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-teal-50 px-3 py-1 text-xs text-teal-700">
        <span>🔍</span>
        <span><b>{{ resultCount }}</b> results for "{{ searchQuery }}"</span>
      </div>
      <p v-if="noResults"
        class="mb-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
        ❌ Nothing found
      </p>
      <div class="min-h-0 flex-1">
        <Table :data="json" :hidden-paths="hiddenPaths" :search-query="searchQuery" :search-fields="searchFields"
          @results="n => emit('results', n)" />
      </div>
    </div>
  </div>

  <!-- Paste modal -->
  <Teleport to="body">
    <div v-if="showPasteModal" class="paste-modal__backdrop" @click.self="closePasteModal">
      <div class="paste-modal">
        <div class="paste-modal__header">
          <span>Paste JSON</span>
          <button class="paste-modal__close" @click="closePasteModal">✕</button>
        </div>
        <div class="paste-modal__body">
          <textarea v-model="pasteText" class="paste-modal__textarea"
            placeholder="Paste your JSON here, or use the Paste button to pull from clipboard..."
            spellcheck="false"></textarea>
        </div>
        <div class="paste-modal__footer">
          <button class="excel-btn excel-btn--primary paste-modal__btn" @click="pasteFromClipboard">
            Paste
          </button>
          <button class="excel-btn excel-btn--secondary paste-modal__btn" @click="confirmPaste">
            OK
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>