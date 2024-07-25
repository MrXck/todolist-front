<script setup>
import {onMounted, ref} from "vue";
import {useDrag} from "@/utils/dragUtils";

const after = ref()
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

onMounted(() => {
  useDrag({
    type: 'after',
    node: after.value,
    item: {
      data
    },
    end: (e, item, dropData, type) => {
      console.log('end', e, item, dropData, type)
    }
  })
})
</script>

<template>
  <div class="after" draggable="true" ref="after"></div>
</template>

<style scoped>
.after {
  cursor: row-resize;
  height: 4px;
  margin-top: auto;
}
</style>
