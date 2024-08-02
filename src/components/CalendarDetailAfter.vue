<script setup>
import {onMounted, ref, toRefs} from "vue";
import {useDrag} from "@/utils/dragUtils";

const after = ref()
const props = defineProps({
  date: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})
const {date, data} = toRefs(props)

onMounted(() => {
  useDrag({
    type: 'after',
    node: after.value,
    item: () => ({
      data: data.value
    }),
    end: (e, item, dropData, type, dropEvent) => {

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
