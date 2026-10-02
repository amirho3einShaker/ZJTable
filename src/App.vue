<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import Index from './pages/index.vue'

const screen = ref('home')
const json = ref(null)
const hiddenPaths = ref([])
const searchQuery = ref('')
const searchFields = ref([])
const noResults = ref(false)
const resultCount = ref(0)
const captured = ref([])
const loadingCaptured = ref(false)
const sourceTabId = ref(null)

const headerData = computed(() =>
  Array.isArray(json.value) ? json.value : json.value ? [json.value] : []
)

const showControls = computed(() =>
  screen.value === 'table' && headerData.value.length > 0
)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('tabId')
  if (id) sourceTabId.value = parseInt(id, 10)
})

function openTable(data) {
  json.value = data
  hiddenPaths.value = []
  searchQuery.value = ''
  searchFields.value = []
  noResults.value = false
  screen.value = 'table'
}

function goHome() {
  screen.value = 'home'
  json.value = null
  captured.value = []
}

function closeWindow() {
  window.close()
}

function onFilterApply(v) {
  hiddenPaths.value = v
}

function onSearch(p) {
  searchQuery.value = p.query
  searchFields.value = p.fields
  noResults.value = false
}

function onSearchFields(v) {
  searchFields.value = v
}

function onResults(n) {
  resultCount.value = n
  noResults.value = n === 0 && searchQuery.value.length > 0
}

async function captureFromPage() {
  if (typeof chrome === 'undefined' || !chrome?.tabs || !chrome?.scripting) {
    alert('This feature is only available in the Chrome extension. Use "Upload JSON File" or "Paste JSON" instead.')
    return
  }

  loadingCaptured.value = true
  try {
    let tabId = sourceTabId.value
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      const realTab = tabs.find(t => !t.url?.startsWith('chrome-extension://'))
      tabId = realTab?.id
    }
    if (!tabId) {
      alert('No valid tab found. Open the extension from a normal web page.')
      return
    }
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const bodyText = document.body.innerText.trim()
        const isWholePageJson =
          (bodyText.startsWith('{') && bodyText.endsWith('}')) ||
          (bodyText.startsWith('[') && bodyText.endsWith(']'))
        if (isWholePageJson) {
          return [{ source: 'Full page', url: location.href, raw: bodyText }]
        }
        const nodes = document.querySelectorAll(
          'script[type="application/json"], script[type="application/ld+json"]'
        )
        const found = []
        nodes.forEach((n, i) => {
          const t = n.textContent?.trim()
          if (t && t.length > 2) {
            found.push({ source: n.id || `Script ${i + 1}`, url: location.href, raw: t })
          }
        })
        return found
      },
    })
    if (!result || result.length === 0) {
      alert('No JSON found on this page')
      return
    }
    if (result.length === 1) {
      try {
        openTable(JSON.parse(result[0].raw))
      } catch {
        alert('The detected content is not valid JSON')
      }
      return
    }
    captured.value = result
    screen.value = 'pick'
  } catch (err) {
    console.error(err)
    alert('Something went wrong. Make sure the active tab is a normal web page (not chrome://).')
  } finally {
    loadingCaptured.value = false
  }
}

function pickCaptured(entry) {
  try {
    openTable(JSON.parse(entry.raw))
  } catch {
    alert('The selected content is not valid JSON')
  }
}

function onFileData(data) {
  openTable(data)
}
</script>

<template>
  <DefaultLayout
    :data="headerData"
    :hidden-paths="hiddenPaths"
    :show-back="screen !== 'home'"
    :show-controls="showControls"
    @filter-apply="onFilterApply"
    @search="onSearch"
    @search-fields="onSearchFields"
    @back="goHome"
    @close="closeWindow"
  >
    <Index
      :screen="screen"
      :json="json"
      :hidden-paths="hiddenPaths"
      :search-query="searchQuery"
      :search-fields="searchFields"
      :no-results="noResults"
      :result-count="resultCount"
      :captured="captured"
      :loading-captured="loadingCaptured"
      @open-table="onFileData"
      @capture-page="captureFromPage"
      @pick-captured="pickCaptured"
      @results="onResults"
    />
  </DefaultLayout>
</template>