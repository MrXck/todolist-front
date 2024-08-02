<script setup>
import {onMounted, ref, toRefs} from "vue";
import {useDrag} from "@/utils/dragUtils";


const before = ref()
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
    type: 'before',
    node: before.value,
    item: () => ({
      data: data.value
    }),
    end: (e, item, dropData, type, dropEvent) => {

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
