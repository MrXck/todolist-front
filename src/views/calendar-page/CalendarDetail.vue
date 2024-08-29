<script setup>
import {computed, onBeforeUnmount, onMounted, provide, reactive, ref, watchEffect} from "vue";
import CalendarDetailItems from "@/components/CalendarDetailItems.vue";
import {getDaysByNum, myDayjs as dayjs} from "@/utils/dayUtils";
import {NDatePicker, NSpace, NScrollbar, NCheckbox} from "naive-ui";
import {
  DateFormat,
  DeleteTodoBatchURL,
  GetTodoByMonthURL,
  SHOW_PRIORITY_KEY, TimeFormat,
  TODO_FUNC_KEY,
  WeekdayFormat
} from "@/utils/Constant";
import request from "@/utils/request";
import {useMainStore} from "@/store";
import Panel from "@/components/Panel.vue";
import {getRenderEventList} from "@/utils/todoListSortUtils";

const showNum = ref(7)
const day = ref(dayjs(new Date()).format(DateFormat))
const today = ref(dayjs(new Date()).format(DateFormat))
const showDay = reactive([])
const timeHeight = ref(100)
const mainStore = useMainStore()
const isLoading = ref(true)
const showPriority = ref({
  '1': true,
  '2': true,
  '3': true,
  '4': true,
  '5': true,
})
const renderTodoList = ref([])
const todoList = ref([])
const time = ref(dayjs(new Date()).format(TimeFormat))
const timeLineStyle = computed(() => {
  const [hour, minute, second] = time.value.split(':')
  return {
    width: '100%',
    height: '2px',
    position: 'absolute',
    backgroundColor: '#a8a8a8',
    zIndex: '100',
    top: `${(parseInt(hour) + (parseInt(minute) + parseInt(second) / 60) / 60) * timeHeight.value}px`,
  }
})
let updateTimeInterval = null
provide(SHOW_PRIORITY_KEY, showPriority)
provide(TODO_FUNC_KEY, {
  updateTodoById,
  addTodo,
  removeTodoById,
})

watchEffect(async () => {
  const {renderList} = getRenderEventList(showDay.map(item => {
    return {date: item}
  }), todoList.value)
  renderTodoList.value = renderList
})

function updateTodoById(id, todo) {
  let data = todoList.value.find(item => item.id === id)
  Object.assign(data, todo)
  delete data['_index']
}

function addTodo(todo) {
  delete todo['_index']
  todoList.value.push(todo)
}

function removeTodoById(id) {
  todoList.value.splice(todoList.value.indexOf(todoList.value.find(item => item.id === id)), 1)
}

function keyDownEvent(e) {
  const keyCode = e.keyCode;
  console.log(keyCode)
  if (keyCode === 39) {
    showNum.value += 1
    updateShowDay()
  } else if (keyCode === 37) {
    showNum.value -= 1
    updateShowDay()
  } else if (e.keyCode === 17) {
    mainStore.keyDown = true
  } else if (e.keyCode === 18) {
    mainStore.altDown = true
  } else if (e.keyCode === 107) {
    timeHeight.value += 20
  } else if (e.keyCode === 109) {
    timeHeight.value -= 20
  }

}

function keyUpEvent(e) {
  if (e.keyCode === 17) {
    mainStore.keyDown = false
  } else if (e.keyCode === 18) {
    mainStore.altDown = false
  } else if (e.keyCode === 46) {
    if (mainStore.selectedIds.length === 0) {
      return
    }
    request.post(DeleteTodoBatchURL, {todoIds: mainStore.selectedIds}).then(res => {
      if (res.code === 0) {
        message.success("操作成功")
        init()
      }
    })
  }
}

function updateTime() {
  clearInterval(updateTimeInterval)
  updateTimeInterval = setInterval(() => {
    time.value = dayjs(new Date()).format(TimeFormat)
  }, 1000)
}

function init() {
  updateShowDay()
  updateTime()
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
      const {renderList} = getRenderEventList(showDay.map(item => {
        return {date: item}
      }), res.data.list)
      todoList.value = res.data.list
      renderTodoList.value = renderList
    }
  }).finally(() => {
    isLoading.value = false
  })
}

const click = (e) => {
  mainStore.showPanel = false
  mainStore.selectedId = 0
}

onMounted(() => {
  document.getElementById('calendar').addEventListener('click', click)
  window.addEventListener('keyup', keyUpEvent)
  window.addEventListener('keydown', keyDownEvent)
  init()
})

onBeforeUnmount(() => {
  clearInterval(updateTimeInterval)
  window.removeEventListener('keyup', keyUpEvent)
  window.removeEventListener('keydown', keyDownEvent)
  document.getElementById('calendar').removeEventListener('click', click)
})
</script>

<template>
  <n-space justify="space-between">
    <n-space justify="start">
      <div style="font-size: 30px">
        {{ `${day.split('-')[0]}年${day.split('-')[1]}月` }}
      </div>
    </n-space>
    <n-space justify="end" align="center">
      <n-checkbox v-model:checked="showPriority['5']">一般</n-checkbox>
      <n-checkbox v-model:checked="showPriority['4']">紧急</n-checkbox>
      <n-checkbox v-model:checked="showPriority['3']">非常紧急</n-checkbox>
      <n-checkbox v-model:checked="showPriority['2']">重要</n-checkbox>
      <n-checkbox v-model:checked="showPriority['1']">非常重要</n-checkbox>
      <n-date-picker type="date" format="yyyy-MM-dd" :formatted-value="day" @update:value="updateDay"/>
    </n-space>
  </n-space>
  <div id="calendar" class="container">
    <div style="display: flex;flex-direction: column;flex: 1;">
      <n-space justify="space-around" style="margin-left: 60px;" item-style="width: 100%" :wrap="false">
        <n-space justify="center" v-for="item in showDay">
          <n-space justify="center">
            {{ `${dayjs(item).format(WeekdayFormat)}` }}<span :class="[
                item === today ? 'now' : ''
            ]">{{ item.split('-')[2] }}</span>
          </n-space>
        </n-space>
      </n-space>
      <n-scrollbar style="height: calc(100vh - 155px)">
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
          <div :style="timeLineStyle">{{ time }}</div>
          <div v-if="!isLoading" class="calendar-detail-list" v-for="(item, index) in showDay" :key="index">
            <CalendarDetailItems :timeHeight="timeHeight" :date="item" :index="index"
                                 :dataList="renderTodoList[index]"/>
          </div>
        </div>
      </n-scrollbar>
    </div>
    <Panel @add="addTodo" @update="updateTodoById" @remove="removeTodoById" :data-list="todoList"/>
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
  position: relative;
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
</style>
