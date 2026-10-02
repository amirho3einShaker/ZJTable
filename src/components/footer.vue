<script setup>
const AUTHOR_GITHUB = 'https://github.com/amirho3einShaker'
const IDEA_GITHUB = 'https://github.com/cheloei'
const ZENIT_URL = 'https://zenit-tm.ir'
</script>

<template>
  <footer class="shrink-0 border-t border-gray-100 bg-white py-2 text-center text-[11px] text-gray-400">
    Developed by
    <a
      :href="AUTHOR_GITHUB"
      target="_blank"
      rel="noreferrer"
      class="font-medium text-teal-600 hover:underline"
    >
      AmirHossein Shaker
    </a>
    , conceived by
    <a
      :href="IDEA_GITHUB"
      target="_blank"
      rel="noreferrer"
      class="font-medium text-teal-600 hover:underline"
    >
      Aboulfazl Cheloyi
    </a>
    at
    <a
      :href="ZENIT_URL"
      target="_blank"
      rel="noreferrer"
      class="font-medium text-purple-600 hover:underline"
    >
      Zenit Software Group
    </a>
  </footer>
</template>