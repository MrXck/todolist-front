<script setup>

const {date, data} = defineProps({
  date: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="before" draggable="true"></div>
</template>

<style scoped>
.before {
  margin-top: 2px;
  cursor: row-resize;
  height: 1px;
}
</style>
