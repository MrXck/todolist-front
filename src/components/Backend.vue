<template>
  <div class="backend" :ref="drag" @mousedown.stop></div>
</template>

<script setup>
import {useDrag} from "vue3-dnd";
import {onMounted} from "vue";
import {getEmptyImage} from "react-dnd-html5-backend";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMainStore} from "@/store";
import {useMessage} from "naive-ui";
import request from "@/utils/request";
import {UpdateTodoByIdURL} from "@/utils/Constant";

const message = useMessage()
const mainStore = useMainStore()
const {data, fullDate} = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullDate: {
    type: String,
    required: true
  },
})

const [, drag, preview] = useDrag({
  type: 'backend',
  item: () => ({
    id: data.id,
    fullDate,
    data
  }),
  end: (_item, monitor) => {
    const result = monitor.getDropResult()
    const item = mainStore.data.find(item => item.id === data.id)
    if (item.endTime === result.dropTime || dayjs(item.endTime).isAfter(dayjs(result.dropTime))) {
      let startTime = item.startTime
      item.startTime = result.dropTime
      request.post(UpdateTodoByIdURL, item).then(res => {
        if (res.code === 0) {
          message.success('操作成功')
          mainStore.updateById(item.id, item)
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
