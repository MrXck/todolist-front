<script setup>
import {NCard, NSpace, useMessage} from 'naive-ui'
import {onMounted, ref} from "vue";
import request from "@/utils/request";
import {GetAllTodoURL, GetDelayTodoURL, GetDoneTodoURL, GetThisMonthTodoURL, GetTodayTodoURL} from "@/utils/Constant";


const total = ref(0)
const done = ref(0)
const month = ref(0)
const today = ref(0)
const delay = ref(0)
const message = useMessage()


function init() {
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
      {{total}}
    </n-card>
    <n-card hoverable title="完成事项数">
      {{done}}
    </n-card>
    <n-card hoverable title="本月事项数">
      {{month}}
    </n-card>
    <n-card hoverable title="今日事项数">
      {{today}}
    </n-card>
    <n-card hoverable title="延期事项数">
      {{delay}}
    </n-card>
  </n-space>
</div>
</template>

<style scoped>

</style>