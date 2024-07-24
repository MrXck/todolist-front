<template>
  <div :class="[
            'first',
            'calendar-item',
            index > 6 ? 'not-top-border' : '',
            index % 7 !== 0 ? 'not-left-border' : ''
        ]"
       :ref="drop"
       @contextmenu.prevent="showPanel"
       @touchstart="touchstart"
       @touchend="touchend"
  >
    <div class="calendar-item-header">
      <n-space v-if="showDetail" justify="space-between">
        <n-space>
          <span :class="now === item.date ? 'now' : ''">{{ item.date.split('-')[2] }}</span>
          <span v-show="showDetail" v-if="judgeFestival(item.date).indexOf('节') !== -1 && judgeFestival(item.date).indexOf('补') === -1"
                style="color: rgb(156 163 175)">{{ judgeFestival(item.date) }}</span>
          <span v-show="showDetail" style="color: rgb(156 163 175)">{{ item.nong.dayCn }}</span>
        </n-space>
        <n-space v-if="showDetail">
          <span v-if="judgeHoliday(item.date)" style="color: rgb(239 68 68)">休</span>
          <span v-if="judgeWorkday(item.date)" style="color: rgb(34 197 94)">班</span>
        </n-space>
      </n-space>
      <div v-if="!showDetail" style="display: flex;justify-content: center;align-items: center">
        <span :class="now === item.date ? 'now' : ''">{{ item.date.split('-')[2] }}</span>
        <span v-show="showDetail" v-if="judgeFestival(item.date).indexOf('节') !== -1 && judgeFestival(item.date).indexOf('补') === -1"
              style="color: rgb(156 163 175)">{{ judgeFestival(item.date) }}</span>
        <span v-show="showDetail" style="color: rgb(156 163 175)">{{ item.nong.dayCn }}</span>
      </div>
    </div>
    <div class="calendar-item-content">
      <n-scrollbar trigger="hover">
        <CalendarItem v-if="dataList !== undefined" :full-date="item.date" :data="data" v-for="(data, index) in dataList" :key="index"/>
      </n-scrollbar>
    </div>
  </div>
</template>

<script setup>
import {getFestival, isHoliday, isWorkday} from "chinese-workday";
import CalendarItem from "@/components/CalendarItem";
import {useDrop} from "vue3-dnd";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMainStore} from "@/store";
import {NScrollbar, NSpace} from 'naive-ui'
import {DateFormat} from "@/utils/Constant";
import {onBeforeUnmount, onMounted, ref} from "vue";

const mainStore = useMainStore()
const now = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(new Date().getDate()).toString().padStart(2, '0')}`

const {index, item: date, dataList} = defineProps({
  index: {
    type: Number,
    required: true
  },
  item: {
    type: Object,
    required: true
  },
  dataList: {
    type: Array,
    required: true
  }
})

let timer = null
const showDetail = ref(null)

const [, drop] = useDrop({
  accept: [
    'backend',
    'forward',
    'move'
  ],
  drop: () => ({
    // drag 侧可以通过 monitor.getDropResult() 拿到该值
    dropTime: date.date,
  }),
  // 当拖拽组件经过组件上时调用该方法。
  hover: (item, monitor) => {
    const dragItem = monitor.getItem()
    // console.log(date, dragItem)
  }
})

function judgeWorkday(value) {
  return isWorkday(value)
}

function judgeHoliday(value) {
  return isHoliday(value)
}

function judgeFestival(value) {
  return getFestival(value)
}

function touchstart(e) {
  clearTimeout(timer)

  timer = setTimeout(() => {
    showPanel(e)
  }, 300)
}

function touchend(e) {
  clearTimeout(timer)
}

function isInDateRange(date, startDate, endDate) {
  return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), null, [])
}

function showPanel(e) {
  mainStore.showPanel = true
  mainStore.panel.dayDiff = dayjs(date.date).startOf('day').diff(dayjs().startOf('day'), 'day')
  mainStore.panel.startTime = dayjs(date.date).format(DateFormat)
  mainStore.panel.endTime = dayjs(date.date).format(DateFormat)
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
}

onMounted(() => {
  showDetail.value = document.documentElement.clientWidth >= 850;
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})

function resize(e) {
  if (document.documentElement.clientWidth < 850) {
    showDetail.value = false
  } else if (document.documentElement.clientWidth > 1000) {
    showDetail.value = true
  }
}
</script>

<style scoped>
.first {
  border: 1px solid rgb(229 231 235);
}

.second {
  border: 1px solid rgb(229 231 235);
  border-left: 0;
}

.calendar-item {
  height: calc((100vh - 64px - 20px - 34px - 10px - 30px) / 6);
}

.not-left-border {
  border-left: 0;
}

.not-top-border {
  border-top: 0;
}

.now {
  background-color: #629bf8;
  border-radius: 50%;
  color: white;
  padding: 3px;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calendar-item-header {
  padding: 4px 8px 4px 8px;
}

.calendar-item-content {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  overflow-y: auto;
  height: calc(100% - 30px);
}
</style>
