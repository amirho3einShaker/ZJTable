<script setup>
import { ref, computed } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({ data: Array })
const emit = defineEmits(['apply'])

const open = ref(false)
const unchecked = ref([])

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
  return [...keys].map(k => ({
    key: k,
    path: [...path, k],
    children: buildTree([...path, k])
  }))
}

const tree = computed(() => buildTree())

function collectPaths(nodes) {
  const out = []
  for (const n of nodes) {
    out.push(n.path.join('.'))
    out.push(...collectPaths(n.children))
  }
  return out
}

const allPaths = computed(() => collectPaths(tree.value))
const checkedPaths = computed(() => allPaths.value.filter(p => !unchecked.value.includes(p)))

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

function toggle(pathStr) {
  const targets = collectSelfAndDescendants(tree.value, pathStr)
  const allChecked = targets.every(p => !unchecked.value.includes(p))
  if (allChecked) {
    const set = new Set(unchecked.value)
    targets.forEach(p => set.add(p))
    unchecked.value = [...set]
  } else {
    const targetSet = new Set(targets)
    unchecked.value = unchecked.value.filter(p => !targetSet.has(p))
  }
  emit('apply', [...unchecked.value])
}

function invert() {
  const leaves = allPaths.value.filter(p => {
    const node = findNode(tree.value, p)
    return node && node.children.length === 0
  })
  const next = new Set(unchecked.value)
  for (const leaf of leaves) {
    next.has(leaf) ? next.delete(leaf) : next.add(leaf)
  }
  unchecked.value = syncParents([...next])
  emit('apply', [...unchecked.value])
}

function syncParents(uncheckedList) {
  const set = new Set(uncheckedList)
  let changed = true
  while (changed) {
    changed = false
    for (const p of allPaths.value) {
      const node = findNode(tree.value, p)
      if (!node || !node.children.length) continue
      const descendants = collectSelfAndDescendants(tree.value, p).slice(1)
      const allDescUnchecked = descendants.every(d => set.has(d))
      if (allDescUnchecked && !set.has(p)) {
        set.add(p)
        changed = true
      } else if (!allDescUnchecked && set.has(p)) {
        set.delete(p)
        changed = true
      }
    }
  }
  return [...set]
}

function resetAll() {
  unchecked.value = []
  emit('apply', [])
}
</script>
<template>
  <div>
    <button
      @click="open = true"
      class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 text-slate-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
      Filter
      <span v-if="unchecked.length" class="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
        {{ unchecked.length }}
      </span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="open = false">
        <div class="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 class="text-base font-bold text-slate-800">Filter Columns</h2>
            <div class="flex items-center gap-2">
              <button @click="invert" class="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">
                Invert
              </button>
              <button @click="open = false" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">✕</button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <TreeNode
              v-for="n in tree"
              :key="n.path.join('.')"
              :node="n"
              :checked-list="checkedPaths"
              @toggle="toggle"
            />
          </div>

          <div class="flex items-center gap-2 border-t border-slate-200 px-5 py-3">
            <span class="text-xs text-slate-500">
              <span class="font-medium text-slate-700">{{ checkedPaths.length }}</span>
              of
              <span class="font-medium text-slate-700">{{ allPaths.length }}</span>
              columns active
            </span>
            <button
              v-if="unchecked.length"
              @click="resetAll"
              class="ml-auto rounded-md border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
            >
              Reset
            </button>
            <span v-if="unchecked.length" class="rounded-full bg-[#107c41] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
              {{ unchecked.length }}
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>