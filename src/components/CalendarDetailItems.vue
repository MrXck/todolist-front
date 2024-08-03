<script setup>
import {NScrollbar, useMessage} from 'naive-ui'
import CalendarDetailItem from "@/components/CalendarDetailItem.vue";
import {inject, onMounted, onUpdated, ref, toRefs} from "vue";
import {useDrop} from "@/utils/dragUtils";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMainStore} from "@/store";
import {AddTodoURL, DateFormat, TimeFormat, TODO_FUNC_KEY, UpdateTodoByIdURL} from "@/utils/Constant";
import request from "@/utils/request";

const props = defineProps({
  timeHeight: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  dataList: {
    type: Array,
  }
})

const {timeHeight, index, date, dataList} = toRefs(props)

let timer = null
const itemsRef = ref()
const timeList = ref([])
const message = useMessage()
const mainStore = useMainStore()
const todoFunc = inject(TODO_FUNC_KEY)

function init() {
  timeList.value = []
  for (let i = 0; i < 24; i++) {
    const hour = `${i.toString().padStart(2, '0')}`
    let num = 0
    const startTime = `${hour}:00:00`
    const endTime = `${hour}:59:59`
    const list = []

    if (dataList.value && dataList.value.length > 0) {
      dataList.value.map(item => {
        const dateStart = dayjs(`${date.value} ${startTime}`)
        const dateEnd = dayjs(`${date.value} ${endTime}`)
        const dataStart = dayjs(`${item.startTime} ${item.planStartTime}`)
        const dataEnd = dayjs(`${item.endTime} ${item.planEndTime}`)

        if (!item.planStartTime || !item.planEndTime) {
          if (startTime === '00:00:00') {
            list.push({
              data: item,
              num
            })
            num += 1
          }
        } else {
          const isShow =
              dateStart.isBetween(dataStart, dataEnd, null, [])
              ||
              dateEnd.isBetween(dataStart, dataEnd, null, [])
              ||
              (dateStart.isBefore(dataEnd) && dateEnd.isAfter(dataStart))
          if (isShow) {
            list.push({
              data: item,
              num
            })
            num += 1
          }
        }
      })
    }

    timeList.value.push({
      startTime,
      endTime,
      list
    })
  }
}

function showPanel(e, hour) {
  mainStore.showPanel = true
  mainStore.panel.dayDiff = dayjs(date.value).startOf('day').diff(dayjs().startOf('day'), 'day')
  mainStore.panel.startTime = dayjs(date.value).format(DateFormat)
  mainStore.panel.endTime = dayjs(date.value).format(DateFormat)
  mainStore.panel.title = ''
  mainStore.panel.detail = ''
  mainStore.panel.predictTime = "00:00:00"
  mainStore.panel.enableEmail = false
  mainStore.panel.id = 0
  mainStore.panel.priority = 5
  mainStore.panel.isDone = false
  mainStore.panel.taskBoxId = null
  mainStore.panel.startDoTime = null
  mainStore.panel.endDoTime = null
  mainStore.panel.noticeType = 1
  mainStore.panel.cronNum = null
  mainStore.selectedId = 0
  mainStore.calcPosition(e)
  const rect = e.target.getBoundingClientRect()
  const minute = Math.ceil((e.clientY - rect.top) / (rect.height) * 60)
  const time = dayjs(`${mainStore.panel.startTime} ${hour}:${minute}:00`)
  mainStore.panel.planStartTime = time.format(TimeFormat)
  mainStore.panel.planEndTime = time.format(TimeFormat)
}

function touchstart(e, hour) {
  clearTimeout(timer)

  timer = setTimeout(() => {
    showPanel(e, hour)
  }, 2000)
}

function touchend(e) {
  clearTimeout(timer)
}

let timeee = {
  timer: null,
  y: 0
}
onMounted(() => {
  init()

  itemsRef.value.map(node => {
    useDrop({
      accept: ['before', 'after', 'move'],
      node,
      drop: (e, item, type) => {
        const data = item.data
        const id = data.id
        const rect = node.getBoundingClientRect()
        const hour = node.getAttribute('data-hour');
        const minute = Math.ceil((e.clientY - rect.top) / (rect.height) * 60)
        const newBeforeDateTime = dayjs(`${date.value} ${hour}:${minute - 2}:00`)
        const oldBeforeDateTime = dayjs(`${data.startTime} ${data.planStartTime ? data.planStartTime : data.predictTime}`)
        const newAfterDateTime = dayjs(`${date.value} ${hour}:${minute + 2}:00`)
        const oldAfterDateTime = dayjs(`${data.endTime} ${data.planEndTime ? data.planEndTime : data.predictTime}`)
        if (type === 'before') {
          if (newBeforeDateTime.isAfter(oldAfterDateTime)) {
            message.error(`开始时间不能大于结束时间`)
            return
          } else {
            data.planStartTime = newBeforeDateTime.format(TimeFormat)
            data.startTime = newBeforeDateTime.format(DateFormat)
          }
        } else if (type === 'after') {
          if (newAfterDateTime.isBefore(oldBeforeDateTime)) {
            message.error(`结束时间不能小于开始时间`)
            return
          } else {
            data.planEndTime = newAfterDateTime.format(TimeFormat)
            data.endTime = newAfterDateTime.format(DateFormat)
          }
        } else if (type === 'move') {
          const second = oldAfterDateTime.diff(oldBeforeDateTime, 'second')
          data.planStartTime = newBeforeDateTime.format(TimeFormat)
          data.startTime = newBeforeDateTime.format(DateFormat)
          const afterDateTime = newBeforeDateTime.add(second, 'second')
          data.endTime = afterDateTime.format(DateFormat)
          data.planEndTime = afterDateTime.format(TimeFormat)
        }
        if (mainStore.keyDown) {
          request.post(AddTodoURL, data).then(res => {
            if (res.code === 0) {
              data.id = res.data
              message.success('操作成功')
              requestAnimationFrame(() => {
                todoFunc.addTodo(data)
              })
            } else {
              message.error(res.msg)
            }
          })
        } else {
          request.post(UpdateTodoByIdURL, data).then(res => {
            if (res.code === 0) {
              message.success('操作成功')
              requestAnimationFrame(() => {
                todoFunc.updateTodoById(id, data)
              })
            } else {
              message.error(res.msg)
            }
          })
        }
      },
      hover: (e, item, type) => {
        if (timeee.y === e.clientY) {
          return
        }

        const data = item.data
        const id = data.id
        const rect = node.getBoundingClientRect()
        const hour = node.getAttribute('data-hour');
        const minute = Math.ceil((e.clientY - rect.top) / (rect.height) * 60)
        const newBeforeDateTime = dayjs(`${date.value} ${hour}:${minute - 2}:00`)
        const oldBeforeDateTime = dayjs(`${data.startTime} ${data.planStartTime ? data.planStartTime : data.predictTime}`)
        const newAfterDateTime = dayjs(`${date.value} ${hour}:${minute + 2}:00`)
        const oldAfterDateTime = dayjs(`${data.endTime} ${data.planEndTime ? data.planEndTime : data.predictTime}`)

        clearTimeout(timeee.timer)

        timeee.timer = setTimeout(() => {

          if (type === 'before') {
            if (newBeforeDateTime.isAfter(oldAfterDateTime)) {
              return
            } else {
              data.planStartTime = newBeforeDateTime.format(TimeFormat)
              data.startTime = newBeforeDateTime.format(DateFormat)
            }
          } else if (type === 'after') {
            if (newAfterDateTime.isBefore(oldBeforeDateTime)) {
              return
            } else {
              data.planEndTime = newAfterDateTime.format(TimeFormat)
              data.endTime = newAfterDateTime.format(DateFormat)
            }
          } else if (type === 'move') {
            if (mainStore.keyDown) {
              return
            }
            const second = oldAfterDateTime.diff(oldBeforeDateTime, 'second')
            data.planStartTime = newBeforeDateTime.format(TimeFormat)
            data.startTime = newBeforeDateTime.format(DateFormat)
            const afterDateTime = newBeforeDateTime.add(second, 'second')
            data.endTime = afterDateTime.format(DateFormat)
            data.planEndTime = afterDateTime.format(TimeFormat)
          }
          todoFunc.updateTodoById(id, data)
        }, 10)
      },
      dropData: () => ({
        date: date.value,
        info: node.getBoundingClientRect(),
        hour: node.getAttribute('data-hour')
      })
    })
  })
})

onUpdated(() => {
  init()
})
</script>

<template>
  <div :class="[
            'first',
            'calendar-detail-items',
            index !== 0 ? 'not-left-border' : ''
        ]">
    <div :class="[
        'time-period',
        index !== 0 ? 'top-border' : ''
    ]" v-for="(i, index) in 24" :data-hour="index.toString().padStart(2, '0')" ref="itemsRef"
         @contextmenu.prevent="showPanel($event, index.toString().padStart(2, '0'))"
         @touchstart="touchstart($event, index.toString().padStart(2, '0'))"
         @touchend="touchend">
      <n-scrollbar trigger="hover" :style="`max-height: ${timeHeight}px`">
        <CalendarDetailItem v-if="timeList[index]?.list" v-for="item in timeList[index].list" :date="date"
                            :startTime="timeList[index].startTime"
                            :endTime="timeList[index].endTime" :data="item.data" :num="item.num"
                            :timeHeight="timeHeight" :key="item.id"/>
      </n-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.calendar-detail-items {
  word-break: break-all;
  overflow: hidden;
  flex: 1;
}

.time-period {
  height: v-bind(timeHeight -1 + 'px');
}

.first {
  border: 1px solid rgb(229 231 235);
}

.top-border {
  border-top: 1px solid rgb(229 231 235);
}

.not-left-border {
  border-left: 0;
}

.not-top-border {
  border-top: 0;
}
</style>
