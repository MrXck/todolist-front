<script setup>
import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import CalendarDetailItems from "@/components/CalendarDetailItems.vue";
import {getDaysByNum, myDayjs as dayjs} from "@/utils/dayUtils";
import {NDatePicker, NSpace, NScrollbar} from "naive-ui";
import {DateFormat, GetTodoByMonthURL} from "@/utils/Constant";
import request from "@/utils/request";
import {useMainStore} from "@/store";

const showNum = ref(7)
const day = ref(dayjs(new Date()).format(DateFormat))
const showDay = reactive([])
const timeHeight = ref(100)
const mainStore = useMainStore()
const isLoading = ref(true)
const key = ref(0)

watch(() => mainStore.dataList, (newVal, oldVal) => {
  key.value += 1
}, {deep: true})

function keyUpEvent(e) {
  const keyCode = e.keyCode;
  console.log(keyCode)
  if (keyCode === 39) {
    showNum.value += 1
  } else if (keyCode === 37) {
    showNum.value -= 1
  }
  updateShowDay()
}

function init() {
  updateShowDay()
}

function updateDay(val) {
  day.value = dayjs(val).format(DateFormat)
  updateShowDay()
}

function updateShowDay() {
  isLoading.value = true
  showDay.length = 0
  showDay.push(...getDaysByNum(day.value, showNum.value))
  mainStore.dateList = showDay.map(item => {
    return {date: item}
  })
  request.post(GetTodoByMonthURL, {
    startTime: showDay[0],
    endTime: showDay[showDay.length - 1],
  }).then(res => {
    if (res.code === 0) {
      mainStore.dataList = res.data.list
      mainStore.data = res.data.list
      mainStore.update()
    }
  }).finally(() => {
    isLoading.value = false
  })
}

onMounted(() => {
  window.addEventListener('keyup', keyUpEvent)
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('keyup', keyUpEvent)
})
</script>

<template>
  <n-space justify="end">
    <n-date-picker type="date" format="yyyy-MM-dd" :formatted-value="day" @update:value="updateDay"/>
  </n-space>
  <div class="container">
    <div style="display: flex;flex-direction: column;flex: 1;">
      <n-space justify="space-around" style="margin-left: 60px;" item-style="width: 100%" :wrap="false">
        <n-space justify="center" v-for="item in showDay">
          <n-space justify="center">
            {{ item }}
          </n-space>
        </n-space>
      </n-space>
      <n-scrollbar style="height: calc(100vh - 140px)">
        <div class="content">
          <div class="time-line">
            <n-space vertical style="gap: 0" justify="space-around">
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">0:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">1:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">2:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">3:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">4:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">5:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">6:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">7:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">8:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">9:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">10:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">11:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">12:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">13:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">14:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">15:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">16:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">17:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">18:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">19:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">20:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">21:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">22:00</n-space>
              <n-space justify="end" :style="'height:' + timeHeight + 'px'">23:00</n-space>
              <n-space justify="end">24:00</n-space>
            </n-space>
          </div>
          <div v-if="!isLoading" class="calendar-detail-list" v-for="(item, index) in showDay">
            <CalendarDetailItems :timeHeight="timeHeight" :date="item" :index="index" :dataList="mainStore.dataList[index]" :key="key"/>
          </div>
        </div>
      </n-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  transition: all .3s;
}

.calendar-detail-list {
  transition: all .3s;
  height: 100%;
  width: 100%;
  display: flex;
}

.time-line {
  position: sticky;
  left: 0;
  padding: 0 10px;
  background-color: white;
  margin-top: -10px;
}

.content {
  display: flex;
  margin-top: 10px;
}
</style>
