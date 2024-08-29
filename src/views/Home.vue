<script setup>
import {NCard, NSpace, useMessage, NTooltip} from 'naive-ui'
import {onMounted, reactive, ref} from "vue";
import request from "@/utils/request";
import {
  GetAllTodoURL,
  GetDateAndCountByUserIdURL,
  GetDelayTodoURL,
  GetDoneTodoURL,
  GetThisMonthTodoURL,
  GetTodayTodoURL
} from "@/utils/Constant";
import dayjs from "dayjs";


const total = ref(0)
const done = ref(0)
const month = ref(0)
const today = ref(0)
const delay = ref(0)
const message = useMessage()
const count = ref(0)
const operationList = ref({})
const dateList = reactive([])


function initOperationList(startDate, endDate) {
  request.post(GetDateAndCountByUserIdURL, {startDate, endDate}).then(res => {
    if (res.code === 0) {
      const dataList = res.data.list
      for (let i = 0; i < dataList.length; i++) {
        const data = dataList[i]
        const date = dayjs(data.createTime.split('T')[0]).format('YYYY-MM-DD')
        operationList.value[date] = data.num
        count.value += data.num
      }
    }
  })
}

function initDate() {
  let date = dayjs(new Date())
  const endDate = date.add(1, 'day').format('YYYY-MM-DD')
  for (let i = 0; i < 365; i++) {
    operationList.value[date.format('YYYY-MM-DD')] = 0
    dateList.push(date.format('YYYY-MM-DD'))
    date = date.subtract(1, 'day')
  }
  const startDate = date.format('YYYY-MM-DD')
  dateList.reverse()
  initOperationList(startDate, endDate)
}

function init() {
  initDate()
  request.get(GetThisMonthTodoURL).then(res => {
    if (res.code === 0) {
      month.value = res.data.count
    } else {
      message.error(res.msg)
    }
  })

  request.get(GetAllTodoURL).then(res => {
    if (res.code === 0) {
      total.value = res.data.count
    } else {
      message.error(res.msg)
    }
  })

  request.get(GetDelayTodoURL).then(res => {
    if (res.code === 0) {
      delay.value = res.data.count
    } else {
      message.error(res.msg)
    }
  })

  request.get(GetDoneTodoURL).then(res => {
    if (res.code === 0) {
      done.value = res.data.count
    } else {
      message.error(res.msg)
    }
  })

  request.get(GetTodayTodoURL).then(res => {
    if (res.code === 0) {
      today.value = res.data.count
    } else {
      message.error(res.msg)
    }
  })
}

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <n-space item-style="width: 32%">
      <n-card hoverable title="总共事项数">
        {{ total }}
      </n-card>
      <n-card hoverable title="完成事项数">
        {{ done }}
      </n-card>
      <n-card hoverable title="本月事项数">
        {{ month }}
      </n-card>
      <n-card hoverable title="今日事项数">
        {{ today }}
      </n-card>
      <n-card hoverable title="延期事项数">
        {{ delay }}
      </n-card>
    </n-space>
    <div style="margin-top: 20px">
      <div>近一年操作了 {{ count }} 次</div>
      <div class="heart-map">
        <n-tooltip trigger="hover" :show-arrow="false" v-for="item in dateList">
          <template #trigger>
            <div :class="[
            'heart-map-item',
            operationList[item] === 0 ? 'negligible' : '',
            operationList[item] > 0 ? 'minor' : '',
            operationList[item] >= 10 ? 'trivial' : '',
            operationList[item] >= 20 ? 'insignificant' : '',
            operationList[item] >= 30 ? 'moderate' : '',
        ]"></div>
          </template>
          <div>
            <div v-if="operationList[item] === 0">
              {{ item }} 当天没有操作
            </div>
            <div v-else>
              {{ item }} 操作 {{ operationList[item] }} 次
            </div>
          </div>
        </n-tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heart-map {
  display: flex;
  flex-wrap: wrap;
}

.heart-map-item {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-left: 4px;
  margin-top: 4px;
  border: 1px solid rgba(27, 31, 35, 0.06);
}

.negligible {
  background-color: #ebedf0;
}

.minor {
  background-color: #c9ffc9;
}

.trivial {
  background-color: #89eb89;
}

.insignificant {
  background-color: #3dd86d;
}

.moderate {
  background-color: #0c9936;
}
</style>
