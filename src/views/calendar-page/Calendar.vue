<template>
  <div id="calendar" style="position: relative">
    <n-space justify="flex-end">
      <n-space>
        <n-date-picker v-model:value="date" type="month" @update:value="show"/>
      </n-space>
      <n-space>
        <n-button round @click="backMonth">
          <template #icon>
            <n-icon>
              <ArrowBackOutline/>
            </n-icon>
          </template>
        </n-button>
      </n-space>
      <n-space>
        <n-button round @click="forwardMonth">
          <template #icon>
            <n-icon>
              <ArrowForwardOutline/>
            </n-icon>
          </template>
        </n-button>
      </n-space>
      <n-space>
        <n-button round @click="nowMonth">今天</n-button>
      </n-space>
    </n-space>
    <n-grid :cols="7" :row="6" style="margin-top: 10px" ref="calendar">
      <n-grid-item style="padding-left: 8px">周日</n-grid-item>
      <n-grid-item style="padding-left: 8px">周一</n-grid-item>
      <n-grid-item style="padding-left: 8px">周二</n-grid-item>
      <n-grid-item style="padding-left: 8px">周三</n-grid-item>
      <n-grid-item style="padding-left: 8px">周四</n-grid-item>
      <n-grid-item style="padding-left: 8px">周五</n-grid-item>
      <n-grid-item style="padding-left: 8px">周六</n-grid-item>
      <n-grid-item v-for="(item, index) in list">
        <CalendarItems :index="index" :item="item" :dataList="mainStore.dataList" :key="key"/>
      </n-grid-item>
    </n-grid>
    <Panel/>
  </div>
</template>

<script setup>
import {NButton, NDatePicker, NGrid, NGridItem, NSpace, NIcon} from 'naive-ui'
import {onMounted, reactive, ref, watch} from "vue"
import {getNextMonthDays, myDayjs as dayjs} from "@/utils/dayUtils";
import {ArrowForwardOutline, ArrowBackOutline} from "@vicons/ionicons5";
import CalendarItems from "@/components/CalendarItems";
import {useMainStore} from "@/store";
import Panel from "@/components/Panel";
import {DateFormat, GetTodoByMonthURL} from "@/utils/Constant";
import request from "@/utils/request";


const date = ref(new Date())
const calendar = ref(null)
const mainStore = useMainStore()
const list = reactive([])
const key = ref(0)

watch(() => mainStore.dataList, (newVal, oldVal) => {
  key.value += 1
}, {deep: true})


function show(value) {
  date.value = new Date(value)
  initList()
}

function initList() {
  list.length = 0
  key.value += 1
  list.push(...getNextMonthDays(date.value.getFullYear(), date.value.getMonth() + 1))
  init()
}

function backMonth() {
  date.value = new Date(dayjs(date.value).subtract(1, 'month').format(DateFormat))
  initList()
}

function forwardMonth() {
  date.value = new Date(dayjs(date.value).add(1, 'month').format(DateFormat))
  initList()
}

function nowMonth() {
  date.value = new Date()
  initList()
}

function init() {
  request.post(GetTodoByMonthURL, {
    startTime: list[0].date,
    endTime: list[list.length - 1].date,
  }).then(res => {
    if (res.code === 0) {
      mainStore.updateData(res.data.list)
    }
  })

}

onMounted(() => {
  initList()

  document.querySelector('#calendar').addEventListener('click', (e) => {
    mainStore.showPanel = false
    mainStore.selectedId = 0
  })
})
</script>

<style scoped>

</style>