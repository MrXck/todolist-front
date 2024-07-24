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
  <div class="after" draggable="true"></div>
</template>

<style scoped>
.after {
  cursor: row-resize;
  height: 1px;
}
</style>
