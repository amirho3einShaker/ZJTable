<script setup>
import { ref, computed } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  data: Array,
  hiddenPaths: { type: Array, default: () => [] }
})
const emit = defineEmits(['search', 'fields'])

const q = ref('')
const searchFields = ref([])
const showTree = ref(false)
const error = ref('')

function getAt(item, path) {
  let node = item
  for (const p of path) {
    if (Array.isArray(node)) node = node[0]
    if (node == null) return undefined
    node = node[p]
  }
  return node
}

function buildTree(path = []) {
  const keys = new Set()
  props.data.forEach(item => {
    const node = getAt(item, path)
    const target = Array.isArray(node) ? node[0] : node
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(k => keys.add(k))
    }
  })
  const result = []
  for (const k of keys) {
    const childPath = [...path, k]
    const pathStr = childPath.join('.')
    const children = buildTree(childPath)
    const isHidden = props.hiddenPaths.includes(pathStr)
    if (!isHidden || children.length > 0) {
      result.push({ key: k, path: childPath, children })
    }
  }
  return result
}

const tree = computed(() => buildTree())

function findNode(nodes, pathStr) {
  for (const n of nodes) {
    if (n.path.join('.') === pathStr) return n
    const f = findNode(n.children, pathStr)
    if (f) return f
  }
  return null
}

function collectSelfAndDescendants(nodes, pathStr) {
  const node = findNode(nodes, pathStr)
  if (!node) return [pathStr]
  const out = []
  const walk = n => {
    out.push(n.path.join('.'))
    n.children.forEach(walk)
  }
  walk(node)
  return out
}

function flatten(nodes) {
  const out = []
  for (const n of nodes) {
    out.push(n)
    out.push(...flatten(n.children))
  }
  return out
}

function syncParents(checkedList) {
  const set = new Set(checkedList)
  let changed = true
  while (changed) {
    changed = false
    for (const n of flatten(tree.value)) {
      if (!n.children.length) continue
      const pathStr = n.path.join('.')
      const allDescChecked = n.children.every(c => set.has(c.path.join('.')))
      if (allDescChecked && !set.has(pathStr)) {
        set.add(pathStr)
        changed = true
      } else if (!allDescChecked && set.has(pathStr)) {
        set.delete(pathStr)
        changed = true
      }
    }
  }
  return [...set]
}

function toggleField(pathStr) {
  const targets = collectSelfAndDescendants(tree.value, pathStr)
  const allChecked = targets.every(p => searchFields.value.includes(p))
  let next
  if (allChecked) {
    const targetSet = new Set(targets)
    next = searchFields.value.filter(p => !targetSet.has(p))
  } else {
    const set = new Set(searchFields.value)
    targets.forEach(p => set.add(p))
    next = [...set]
  }
  searchFields.value = syncParents(next)
  error.value = ''
  emit('fields', [...searchFields.value])
  if (q.value && searchFields.value.length) {
    emit('search', { query: q.value.trim(), fields: [...searchFields.value] })
  } else if (!searchFields.value.length) {
    emit('search', { query: '', fields: [] })
  }
}

function doSearch() {
  if (!searchFields.value.length) {
    error.value = 'Select a column first'
    return
  }
  error.value = ''
  emit('search', { query: q.value.trim(), fields: [...searchFields.value] })
}

function clearFields() {
  searchFields.value = []
  q.value = ''
  error.value = ''
  emit('fields', [])
  emit('search', { query: '', fields: [] })
}
</script>
<template>
  <div class="relative w-full max-w-md min-w-[260px]">
    <div
      class="flex items-center overflow-hidden rounded-md border bg-white shadow-sm transition"
      :class="error ? 'border-rose-300' : 'border-slate-200 focus-within:border-slate-400'"
    >
      <button
        type="button"
        @click="showTree = !showTree"
        class="flex h-9 items-center gap-1 border-r border-slate-200 px-2.5 text-xs transition hover:bg-slate-50"
        :class="searchFields.length ? 'text-[#107c41]' : 'text-slate-400'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <span v-if="searchFields.length" class="font-bold">{{ searchFields.length }}</span>
      </button>
      <input
        v-model="q"
        :placeholder="searchFields.length ? 'Search...' : 'Select column'"
        class="flex-1 border-0 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        @keyup.enter="doSearch"
        @input="error = ''"
      />
      <button
        type="button"
        @click="doSearch"
        class="flex h-9 w-10 items-center justify-center bg-[#107c41] text-white transition hover:bg-[#0e6a37] active:bg-[#0b5529]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
          <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="absolute right-0 -bottom-5 text-[11px] text-rose-500">{{ error }}</p>
    <div v-if="showTree" class="fixed inset-0 z-40" @click="showTree = false"></div>
    <div
      v-if="showTree"
      class="absolute right-0 z-50 mt-2 max-h-96 w-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
    >
      <p class="mb-2 text-xs text-slate-500">Where to search?</p>
      <TreeNode
        v-for="n in tree"
        :key="n.path.join('.')"
        :node="n"
        :checked-list="searchFields"
        @toggle="toggleField"
      />
      <button
        v-if="searchFields.length"
        @click="clearFields"
        class="mt-3 w-full rounded-md border border-rose-200 py-1 text-xs text-rose-600 hover:bg-rose-50"
      >
        Clear
      </button>
    </div>
  </div>
</template>