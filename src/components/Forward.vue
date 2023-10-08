<template>
  <div class="forward" :ref="drag"></div>
</template>

<script setup>
import {useDrag} from "vue3-dnd";
import {onMounted} from "vue";
import {getEmptyImage} from "react-dnd-html5-backend";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMainStore} from "@/store";
import {useMessage} from 'naive-ui'
import request from "@/utils/request";
import {UpdateTodoByIdURL} from "@/utils/Constant";

const message = useMessage()
const mainStore = useMainStore()
const {fullDate, data} = defineProps({
  fullDate: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})

const [, drag, preview] = useDrag({
  type: 'forward',
  item: () => ({
    id: data.id,
    fullDate,
    data
  }),
  end: (_item, monitor) => {
    const result = monitor.getDropResult()
    if (data.startTime === result.dropTime || dayjs(data.startTime).isBefore(dayjs(result.dropTime))) {
      let endTime = data.endTime
      data.endTime = result.dropTime
      request.post(UpdateTodoByIdURL, data).then(res => {
        if (res.code === 0) {
          message.success('操作成功')
          mainStore.update()
        } else {
          data.endTime = endTime
          message.error(res.msg)
        }
      })
    } else {
      message.error('结束时间必须大于等于起始时间')
    }
  },
})

onMounted(() => {
  const emptyImage = getEmptyImage()
  preview(emptyImage, { captureDraggingState: true })
})
</script>

<style scoped>
.forward {
  width: 4px;
  cursor: ew-resize;
}
</style>