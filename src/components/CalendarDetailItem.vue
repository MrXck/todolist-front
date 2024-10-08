<script setup>
import {computed, inject, onMounted, ref, toRefs} from "vue";
import {useDrag} from "@/utils/dragUtils";
import CalendarDetailBefore from "@/components/CalendarDetailBefore.vue";
import CalendarDetailAfter from "@/components/CalendarDetailAfter.vue";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {removeTodo} from "@/utils/apiUtils";
import {useMainStore} from "@/store";
import {useMessage} from 'naive-ui'
import {SHOW_PRIORITY_KEY, TODO_FUNC_KEY} from "@/utils/Constant";

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  num: {
    type: Number,
    required: true
  },
  timeHeight: {
    type: Number,
    required: true
  },
})
const {date, startTime, endTime, data, num, timeHeight} = toRefs(props)
const message = useMessage()
const mainStore = useMainStore()
const itemRef = ref()

const isStart = computed(() => dayjs(`${data.value.startTime} ${data.value.planStartTime}`).isBetween(dayjs(`${date.value} ${startTime.value}`), dayjs(`${date.value} ${endTime.value}`), null, []))
const isEnd = computed(() => dayjs(`${data.value.endTime} ${data.value.planEndTime}`).isBetween(dayjs(`${date.value} ${startTime.value}`), dayjs(`${date.value} ${endTime.value}`), null, []))

const transformTop = computed(() => {
  const minute = dayjs(`${data.value.startTime} ${data.value.planStartTime}`).minute()
  return isStart.value ? Math.floor(minute / 60 * (timeHeight.value - 1)) : 0
})
const transformBottom = computed(() => {
  const minute = dayjs(`${data.value.endTime} ${data.value.planEndTime}`).minute()
  return Math.max(isEnd.value ? Math.floor(minute / 60 * (timeHeight.value - 1) - transformTop.value) : timeHeight.value - 1 - transformTop.value, 0)
})
const showLines = computed(() => {
  return Math.floor((transformBottom.value - 16) / 16)
})
const showPriority = inject(SHOW_PRIORITY_KEY)
const todoFunc = inject(TODO_FUNC_KEY)

function showPanel(e) {
  if (mainStore.altDown) {
    removeTodo(data.value.id).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
        todoFunc.removeTodoById(data.value.id)
        mainStore.showPanel = false
      } else {
        message.error(res.msg)
      }
    })
  } else {
    e.stopPropagation()
    e.preventDefault()
    mainStore.showPanel = true
    mainStore.selectedId = data.value.id
    Object.assign(mainStore.panel, data.value)
    mainStore.panel.dayDiff = dayjs(data.value.endTime).startOf('day').diff(dayjs(new Date()).startOf('day'), 'day')
    mainStore.calcPosition(e)
  }
}

onMounted(() => {
  useDrag({
    type: 'move',
    node: itemRef.value,
    item: () => ({
      data: data.value
    }),
    end: (e, item, dropData) => {
      // console.log('item', e, item, dropData)
    }
  })
})
</script>

<template>
  <div :class="[
      'calendar-detail-item',
      data.isDone ? 'done' : '',
      data.priority === 1 ? 'first' : '',
      data.priority === 2 ? 'second' : '',
      data.priority === 3 ? 'third' : '',
      data.priority === 4 ? 'fourth' : '',
      isStart ? 'top-border is-start' : '',
      isEnd ? 'bottom-border' : '',
      transformBottom < 25 ? 'is-end' : '',
      !data.isDone && dayjs(data.endTime).startOf('day').isBefore(dayjs(new Date()).startOf('day')) ? 'delay' : '',
      mainStore.selectedId === data.id ? 'selected' : '',
      mainStore.selectedIds.indexOf(data.id) !== -1 ? 'selected' : '',
      ]" ref="itemRef" :style="`margin-left: ${data._index * 20}px;z-index: ${data._index * 20};transform:`"
       draggable="true"
       v-if="showPriority[data.priority]"
       @click="showPanel">
    <CalendarDetailBefore v-if="isStart" :date="date" :data="data"/>
    <div class="todo-title" v-if="isStart">{{ data.title }}
      <span class="period">{{ `${data.planStartTime} - ${data.planEndTime}` }}</span>
    </div>
    <CalendarDetailAfter v-if="isEnd" :date="date" :data="data"/>
  </div>
</template>

<style scoped>
.calendar-detail-item {
  word-break: break-all;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #85f594;
  --bg-color: #85f594;
  cursor: pointer;
  height: v-bind(transformBottom+ 'px');
  position: absolute;
  width: 100%;
  padding-left: 6px;
  --font-size: 16px;
}

.todo-title {
  /* 多行文本溢出 */
  /* 多行区域一共显示的行数 */
  -webkit-line-clamp: v-bind(showLines);
  /* 将溢出部分换成... */
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  padding: 0 4px;
  flex: 1;
  overflow: hidden;
}

.calendar-detail-item:before {
  content: '';
  position: absolute;
  left: 0;
  width: 6px;
  background-color: var(--bg-color);
  filter: brightness(.92);
  height: 100%;
}

.is-start {
  transform: translateY(v-bind(transformTop+ 'px'));
}

.is-end {
  font-size: 0;
}

.bottom-border {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.top-border {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.calendar-detail-item.first {
  color: #ec49a0;
  background-color: #ffb7d6;
  --bg-color: #ffb7d6;
  border: 0;
}

.calendar-detail-item.second {
  color: #8e70ff;
  background-color: #efc6fd;
  --bg-color: #efc6fd;
}

.calendar-detail-item.third {
  color: #d49130;
  background-color: #fddec3;
  --bg-color: #fddec3;
}

.calendar-detail-item.fourth {
  color: #4685da;
  background-color: #afc8ff;
  --bg-color: #afc8ff;
}

.calendar-detail-item.delay {
  background-color: #e77e80;
  color: #762224;
  --bg-color: #e77e80;
}

.period {
  font-size: 10px;
  filter: brightness(.6);
  vertical-align: text-bottom;
}

.selected {
  filter: brightness(0.92) !important;
  z-index: 500 !important;
}

.calendar-detail-item.done {
  background-color: #a6e7ff !important;
  --bg-color: #a6e7ff;
}
</style>
