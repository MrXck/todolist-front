<script setup>
import {computed, onMounted, ref} from "vue";
import {useDrag} from "@/utils/dragUtils";
import CalendarDetailBefore from "@/components/CalendarDetailBefore.vue";
import CalendarDetailAfter from "@/components/CalendarDetailAfter.vue";
import {myDayjs as dayjs} from "@/utils/dayUtils";

const {date, startTime, endTime, data, num, timeHeight} = defineProps({
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

const isStart = ref(dayjs(`${data.startTime} ${data.planStartTime}`).isBetween(dayjs(`${date} ${startTime}`), dayjs(`${date} ${endTime}`), null, []))
const isEnd = ref(dayjs(`${data.endTime} ${data.planEndTime}`).isBetween(dayjs(`${date} ${startTime}`), dayjs(`${date} ${endTime}`), null, []))
const itemRef = ref()
const transformTop = computed(() => {
  const minute = dayjs(`${data.startTime} ${data.planStartTime}`).minute()
  return isStart.value ? Math.floor(minute / 60 * (timeHeight - 1)) : 0
})
const transformBottom = computed(() => {
  const minute = dayjs(`${data.endTime} ${data.planEndTime}`).minute()
  return Math.max(isEnd.value ? Math.floor(minute / 60 * (timeHeight - 1)) : timeHeight - 1 - transformTop.value, 0)
})
const showLines = computed(() => {
  return Math.floor((transformBottom.value - 18) / 16)
})

onMounted(() => {
  useDrag({
    type: 'move',
    node: itemRef.value,
    item: {
      data
    },
    end: (e, item, dropData) => {
      console.log('item', e, item, dropData)
    }
  })

})

</script>

<template>
  <div :class="[
      'calendar-detail-item',
      data.priority === 1 ? 'first bold' : '',
      data.priority === 2 ? 'second bold' : '',
      data.priority === 3 ? 'third bold' : '',
      data.priority === 4 ? 'fourth bold' : '',
      isStart ? 'top-border is-start' : '',
      isEnd ? 'bottom-border' : '',
      transformBottom < 25 ? 'is-end' : ''
      ]" ref="itemRef" :style="`margin-left: ${num * 20}px;z-index: ${num * 20};transform:`" draggable="true">
    <CalendarDetailBefore v-if="isStart" :date="date" :data="data"/>
    <div class="todo-title" v-if="isStart">{{ data.title }} <span class="period" v-if="isStart">{{`${data.planStartTime} - ${data.planEndTime}`}}</span></div>
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
  height: v-bind(transformBottom + 'px');
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
  transform: translateY(v-bind(transformTop + 'px'));
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
  background-color: #ffc9cb;
  --bg-color: #ffc9cb;
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

.period {
  font-size: 10px;
  filter: brightness(.6);
  vertical-align: text-bottom;
}
</style>
