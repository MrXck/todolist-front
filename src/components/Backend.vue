<template>
  <div class="backend" :ref="drag" @mousedown.stop></div>
</template>

<script setup>
import {useDrag} from "vue3-dnd";
import {inject, onMounted, toRefs} from "vue";
import {getEmptyImage} from "react-dnd-html5-backend";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMessage} from "naive-ui";
import request from "@/utils/request";
import {TODO_FUNC_KEY, UpdateTodoByIdURL} from "@/utils/Constant";

const message = useMessage()
const props = defineProps({
  fullDate: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})
const {fullDate, data} = toRefs(props)
const todoFunc = inject(TODO_FUNC_KEY)

const [, drag, preview] = useDrag({
  type: 'backend',
  item: () => ({
    id: data.value.id,
    fullDate: fullDate.value,
    data: data.value
  }),
  end: (_item, monitor) => {
    const result = monitor.getDropResult()
    const item = data.value
    if (item.endTime === result.dropTime || dayjs(item.endTime).isAfter(dayjs(result.dropTime))) {
      let startTime = item.startTime
      item.startTime = result.dropTime
      request.post(UpdateTodoByIdURL, item).then(res => {
        if (res.code === 0) {
          message.success('操作成功')
          todoFunc.updateTodoById(item.id, item)
        } else {
          item.startTime = startTime
          message.error(res.msg)
        }
      })
    } else {
      message.error('起始时间必须大于等于结束时间')
    }
  },
})

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true })
})
</script>

<style scoped>
.backend {
  width: 4px;
  cursor: ew-resize;
}
</style>
