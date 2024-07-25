<script setup>

import {onMounted, ref} from "vue";
import {useDrag} from "@/utils/dragUtils";

const before = ref()
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
    type: 'before',
    node: before.value,
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
  <div class="before" draggable="true" ref="before"></div>
</template>

<style scoped>
.before {
  cursor: row-resize;
  height: 4px;
  padding-top: 1px;
}
</style>
