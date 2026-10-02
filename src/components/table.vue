<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['results'])

const props = defineProps({
  data: [Array, Object],
  depth: { type: Number, default: 0 },
  pathPrefix: { type: Array, default: () => [] },
  hiddenPaths: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  searchFields: { type: Array, default: () => [] }
})

const isPrimitiveList = computed(() => {
  const src = Array.isArray(props.data) ? props.data : [props.data]
  return src.length > 0 && src.every(item => item === null || typeof item !== 'object')
})

const items = computed(() => {
  const src = Array.isArray(props.data) ? props.data : [props.data]
  const q = props.searchQuery.toLowerCase().trim()
  let filtered = src
  if (props.depth === 0 && q && props.searchFields.length) {
    filtered = src.filter(item =>
      props.searchFields.some(field => fieldMatches(item, field.split('.'), q))
    )
  }
  if (isPrimitiveList.value) {
    return filtered.map(v => ({ value: v }))
  }
  return filtered
})

watch(() => items.value.length, n => {
  if (props.depth === 0) emit('results', n)
}, { immediate: true })

function fieldMatches(item, path, q) {
  return valuesAtPath(item, path).some(v =>
    JSON.stringify(v).toLowerCase().includes(q)
  )
}

function valuesAtPath(node, path) {
  if (path.length === 0) return [node]
  if (Array.isArray(node)) return node.flatMap(n => valuesAtPath(n, path))
  if (!node || typeof node !== 'object') return []
  return valuesAtPath(node[path[0]], path.slice(1))
}

const keys = computed(() => {
  const all = [...new Set(items.value.flatMap(item =>
    item && typeof item === 'object' ? Object.keys(item) : []
  ))]
  return all.filter(k => {
    const full = [...props.pathPrefix, k].join('.')
    if (!props.hiddenPaths.includes(full)) return true
    return items.value.some(item => {
      if (!item || typeof item !== 'object') return false
      const val = item[k]
      const target = Array.isArray(val) ? val[0] : val
      return target && typeof target === 'object' && hasVisibleDesc(target, [...props.pathPrefix, k])
    })
  })
})

function hasVisibleDesc(obj, prefix) {
  for (const k of Object.keys(obj)) {
    const path = [...prefix, k].join('.')
    if (!props.hiddenPaths.includes(path)) return true
    const child = obj[k]
    const target = Array.isArray(child) ? child[0] : child
    if (target && typeof target === 'object' && hasVisibleDesc(target, [...prefix, k])) return true
  }
  return false
}

const columnWidths = ref({})

function colStyle(key) {
  const w = columnWidths.value[key]
  if (!w) return {}
  return { width: w + 'px', minWidth: w + 'px', maxWidth: w + 'px' }
}

function startResize(e, key) {
  e.preventDefault()
  e.stopPropagation()
  const th = e.currentTarget.parentElement
  const startX = e.pageX
  const startWidth = th.offsetWidth
  function onMove(ev) {
    const w = Math.max(60, startWidth + (ev.pageX - startX))
    columnWidths.value = { ...columnWidths.value, [key]: w }
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const expanded = ref(new Set())
const isExpanded = (i, k) => expanded.value.has(`${i}::${k}`)

function toggle(i, k) {
  const id = `${i}::${k}`
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}
</script>

<template>
  <div class="excel-wrapper" :class="{ 'is-nested': depth > 0 }">
    <table v-if="data && typeof data == 'object'">
      <thead>
        <tr>
          <th class="row-num">#</th>
          <th
            v-for="key in keys"
            :key="key"
            :style="colStyle(key)"
          >
            <span class="th-label">{{ key }}</span>
            <span
              class="col-resizer"
              @mousedown="startResize($event, key)"
            ></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="i">
          <td class="row-num">{{ i + 1 }}</td>
          <td
            v-for="key in keys"
            :key="key"
            :style="colStyle(key)"
          >
            <div v-if="item[key] === null || item[key] === undefined || item[key] === ''" class="cell empty">
              —
            </div>
            <Table
              v-else-if="typeof item[key] === 'object'"
              :data="item[key]"
              class="nested"
              :depth="depth + 1"
              :path-prefix="[...pathPrefix, key]"
              :hidden-paths="hiddenPaths"
              :search-query="searchQuery"
              :search-fields="searchFields"
            />
            <div v-else-if="typeof item[key] === 'number'" class="cell num">
              {{ item[key].toLocaleString() }}
            </div>
            <div
              v-else
              class="cell text"
              :class="{ expanded: isExpanded(i, key) }"
              :title="String(item[key])"
              @click="toggle(i, key)"
            >
              {{ item[key] }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import '../assets/css/table.css';
</style>