<template>
  <div :class="[
      'calendar-item-item',
  ]" ref="item" v-if="data !== null">
    <Backend :data="data" v-if="data.startTime === fullDate" :full-date="fullDate"/>
    <div :id="data.id" @click="showPanel" :ref="drag" @mousedown.stop :class="[
      'content',
      data.startTime === fullDate ? 'left-border' : '',
      data.endTime === fullDate ? 'right-border' : '',
      data.isDone ? 'done' : '',
      data.priority === 1 ? 'first bold' : '',
      data.priority === 2 ? 'second bold' : '',
      data.priority === 3 ? 'third bold' : '',
      data.priority === 4 ? 'fourth bold' : '',
      mainStore.selectedId === data.id ? 'selected' : '',
      mainStore.selectedIds.indexOf(data.id.toString()) !== -1 ? 'selected' : '',
      !data.isDone && dayjs(data.endTime).startOf('day').isBefore(dayjs(new Date()).startOf('day')) ? 'delay' : ''
        ]">{{ data.title }}
    </div>
    <Forward :data="data" v-if="data.endTime === fullDate" :full-date="fullDate"/>
  </div>
  <div v-else class="calendar-item-item"></div>
</template>

<script setup>
import Backend from "@/components/Backend";
import Forward from "@/components/Forward";
import {onMounted, ref} from "vue";
import {useMainStore} from "@/store";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useDrag} from "vue3-dnd";
import request from "@/utils/request";
import {AddTodoURL, DateFormat, UpdateTodoByIdURL} from "@/utils/Constant";
import {getEmptyImage} from "react-dnd-html5-backend";
import {useMessage} from 'naive-ui'
import {removeTodo} from "@/utils/apiUtils";

const mainStore = useMainStore()
const message = useMessage()
const item = ref(null)
const {data, fullDate, show} = defineProps({
  data: {
    required: true
  },
  fullDate: {
    type: String,
    required: true
  },
})

function showPanel(e) {
  if (mainStore.altDown) {
    removeTodo(data.id).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
        mainStore.data.splice(mainStore.data.indexOf(mainStore.data.find(item => item.id === data.id)), 1)
        mainStore.update()
        mainStore.showPanel = false
      } else {
        message.error(res.msg)
      }
    })
  } else {
    e.stopPropagation()
    e.preventDefault()
    mainStore.showPanel = true
    mainStore.selectedId = data.id
    const item = mainStore.data.find(item => item.id === data.id)
    Object.assign(mainStore.panel, item)
    mainStore.panel.dayDiff = dayjs(item.endTime).startOf('day').diff(dayjs(new Date()).startOf('day'), 'day')
    mainStore.calcPosition(e)
  }
}

const [, drag, preview] = useDrag({
  type: 'move',
  item: () => ({
    id: data.id,
    fullDate,
    data
  }),
  end: (_item, monitor) => {
    const result = monitor.getDropResult()
    const item = mainStore.data.find(item => item.id === data.id)

    let fullDateTime = dayjs(fullDate)
    let startTime = dayjs(item.startTime)
    let endTime = dayjs(item.endTime)
    let diff = dayjs(result.dropTime).startOf('day').diff(fullDateTime.startOf('day'), 'day')

    if (!mainStore.keyDown && diff === 0) {
      return
    }

    if (!mainStore.keyDown) {
      item.startTime = startTime.add(diff, 'day').format(DateFormat)
      item.endTime = endTime.add(diff, 'day').format(DateFormat)

      request.post(UpdateTodoByIdURL, item).then(res => {
        if (res.code === 0) {
          message.success('操作成功')
          mainStore.updateById(item.id, item)
        } else {
          item.endTime = endTime.format(DateFormat)
          item.startTime = startTime.format(DateFormat)
          message.error(res.msg)
        }
      })
    } else {
      const data = Object.assign({}, item)
      data.startTime = startTime.add(diff, 'day').format(DateFormat)
      data.endTime = endTime.add(diff, 'day').format(DateFormat)
      request.post(AddTodoURL, data).then(res => {
        if (res.code === 0) {
          data.id = res.data
          message.success('操作成功')
          mainStore.data.push(JSON.parse(JSON.stringify(data)))
          mainStore.update()
        } else {
          message.error(res.msg)
        }
      })
    }
  },
})

onMounted(() => {
  const emptyImage = getEmptyImage()
  preview(emptyImage, {captureDraggingState: true})
})
</script>

<style scoped>
.calendar-item-item {
  margin-bottom: 4px;
  display: flex;
  height: 20px;
}

.calendar-item-item .content {
  flex: 1;
  background-color: #85f594;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 4px;
  cursor: pointer;
}

.left-border {
  border-top-left-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.right-border {
  border-top-right-radius: .25rem;
  border-bottom-right-radius: .25rem;
}

.selected {
  filter: brightness(0.92) !important;
}

.calendar-item-item .done {
  background-color: #a6e7ff !important;
}

.calendar-item-item .first {
  color: #ec49a0;
  background-color: #ffb7d6;
}

.calendar-item-item .second {
  color: #8e70ff;
  background-color: #efc6fd;
}

.calendar-item-item .third {
  color: #d49130;
  background-color: #fddec3;
}

.calendar-item-item .fourth {
  color: #4685da;
  background-color: #afc8ff;
}

.calendar-item-item .delay {
  background-color: #e77e80;
  color: #762224;
}

.bold {
  font-weight: bold;
}
</style>
