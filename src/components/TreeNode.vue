<script setup>
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  node: Object,
  checkedList: { type: Array, default: () => [] }
})
defineEmits(['toggle'])

const open = ref(true)
const checkboxRef = ref(null)
const pathStr = computed(() => props.node.path.join('.'))

function collectAll(n) {
  const out = [n.path.join('.')]
  n.children.forEach(c => out.push(...collectAll(c)))
  return out
}

const allPaths = computed(() => collectAll(props.node))
const checkedCount = computed(() =>
  allPaths.value.filter(p => props.checkedList.includes(p)).length
)
const isAllChecked = computed(() =>
  checkedCount.value === allPaths.value.length
)
const isIndeterminate = computed(() =>
  checkedCount.value > 0 && !isAllChecked.value
)

watchEffect(() => {
  if (checkboxRef.value) {
    checkboxRef.value.indeterminate = isIndeterminate.value
  }
})

const id = computed(() => `cb-${pathStr.value}`)
</script>
<template>
  <div>
    <div class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
      <button
        v-if="node.children.length"
        @click="open = !open"
        class="flex h-4 w-4 shrink-0 items-center justify-center text-[9px] text-slate-400"
      >
        {{ open ? '▼' : '▶' }}
      </button>
      <span v-else class="h-4 w-4 shrink-0" />

      <input
        :id="id"
        ref="checkboxRef"
        type="checkbox"
        class="h-4 w-4 shrink-0 cursor-pointer accent-[#107c41]"
        :checked="isAllChecked"
        @change="$emit('toggle', pathStr)"
      />

      <label
        :for="id"
        class="flex-1 cursor-pointer select-none text-sm"
        :class="isAllChecked || isIndeterminate ? 'text-slate-700' : 'text-slate-400'"
      >
        {{ node.key }}
      </label>
    </div>

    <div v-if="node.children.length && open" class="ml-4 border-l border-slate-100 pl-2">
      <TreeNode
        v-for="c in node.children"
        :key="c.path.join('.')"
        :node="c"
        :checked-list="checkedList"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>