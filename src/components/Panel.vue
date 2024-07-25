<template>
  <transition name="fade" v-if="!isMobile()">
    <div @click.stop.prevent class="panel" v-show="mainStore.showPanel"
         :style="`top: ${mainStore.panelPosition.y}px;left: ${mainStore.panelPosition.x}px;`">
      <div class="panel-header">
        <n-checkbox v-show="mainStore.panel.id !== 0" size="large" v-model:checked="mainStore.panel.isDone"
                    @update:checked="toggle" style="margin-right: 4px"></n-checkbox>
        <n-date-picker type="daterange" style="width: 70%" :default-value="mainStore.panelDate"
                       v-model:value="panelDate" :shortcuts="shortcuts" @update:value="changePicker">
          <template #date-icon>
            <span style="opacity: 0">1</span>
          </template>
        </n-date-picker>
        <div class="day-diff" v-if="mainStore.panel.dayDiff < 0 && mainStore.panel.id === 0" style="color: red">
          延期{{ Math.abs(mainStore.panel.dayDiff) }}天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id === 0"
             style="color: rgb(34, 197, 94);">今天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id === 0"
             style="color: rgb(34, 197, 94);">
          还剩{{ mainStore.panel.dayDiff }}天
        </div>

        <div class="day-diff" v-if="mainStore.panel.dayDiff < 0 && mainStore.panel.id !== 0" style="color: red">
          延期{{ Math.abs(mainStore.panel.dayDiff) }}天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id !== 0"
             style="color: rgb(34, 197, 94);">今天截止
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id !== 0"
             style="color: rgb(34, 197, 94);">
          还剩{{ mainStore.panel.dayDiff }}天
        </div>
        <n-button text @click="mainStore.showPanel = false">
          <template #icon>
            <n-icon>
              <Close/>
            </n-icon>
          </template>
        </n-button>
      </div>
      <div style="height: 1px; margin: 8px 0;color: rgb(243 244 246 / 1);background-color: rgb(243 244 246 / 1)"></div>
      <div class="panel-body">
        <n-space align="center" style="margin-bottom: 4px">
          <n-space align="center" justify="center">
            持续时间
            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.planStartTime" placeholder="开始时间" default-formatted-value="00:00:00" size="small"></n-time-picker>
            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.planEndTime" placeholder="结束时间" default-formatted-value="00:00:00" size="small"></n-time-picker>
          </n-space>
        </n-space>
        <n-space align="center" style="margin-bottom: 4px">
          <n-space align="center" justify="center">
            邮件提醒(持续时间即为提醒时间)
            <n-switch v-model:value="mainStore.panel.enableEmail"/>
          </n-space>
        </n-space>
        <n-space v-if="mainStore.panel.enableEmail" align="center">
          <n-space align="center">
            提醒类型
            <n-select size="small" :options="NoticeTypeOptions" v-model:value="mainStore.panel.noticeType" style="width: 100px"></n-select>
            <n-select v-show="NoticeTypeOptions.find(item => item.value === mainStore.panel.noticeType).child.length !== 0" size="small" :options="NoticeTypeOptions.find(item => item.value === mainStore.panel.noticeType).child" v-model:value="mainStore.panel.cronNum" style="width: 100px"></n-select>
          </n-space>
<!--          <n-space justify="center">-->
<!--            提醒时间-->
<!--            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.predictTime" placeholder="预计开始时间" default-formatted-value="00:00:00" size="small"></n-time-picker>-->
<!--          </n-space>-->
        </n-space>
        <n-space justify="space-between" v-if="mainStore.panel.id !== 0" style="margin-bottom: 4px">
          <n-space justify="start" align="center">
            <n-button v-if="mainStore.panel.startDoTime === null" size="tiny" @click="startTodo">开始</n-button>
            <div v-else>开始: {{mainStore.panel.startDoTime.replace('T', ' ')}}</div>
          </n-space>
          <n-space justify="start" align="center">
            <n-button v-if="mainStore.panel.endDoTime === null && mainStore.panel.startDoTime" size="tiny" @click="endTodo">结束</n-button>
            <div v-if="mainStore.panel.endDoTime !== null && mainStore.panel.startDoTime">结束: {{mainStore.panel.endDoTime.replace('T', ' ')}}</div>
          </n-space>
        </n-space>
        <n-space v-if="mainStore.panel.endDoTime && mainStore.panel.startDoTime">总计: {{period}}</n-space>
        <n-space vertical justify="space-around">
          <n-input placeholder="准备做点什么" v-model:value="mainStore.panel.title"/>
          <n-input
              placeholder="描述"
              type="textarea"
              v-model:value="mainStore.panel.detail"
              :autosize="{
                minRows: 4,
                maxRows: 4
              }"
          ></n-input>
          <n-space>
            <n-space>
              <n-select v-model:value="mainStore.panel.taskBoxId" size="small" style="width: 200px" :options="mainStore.taskListOptions"/>
            </n-space>
          </n-space>
          <n-space justify="space-between">
            <n-space>
              <n-select v-model:value="mainStore.panel.priority" size="small" style="width: 150px" :options="options"/>
            </n-space>
            <n-space justify="end" align="center">
              <n-button size="small" type="success" @click="saveTodo">保存</n-button>
              <n-button text type="error" v-if="mainStore.panel.id !== 0" size="small" @click="remove">
                <template #icon>
                  <n-icon :size="20">
                    <Trash/>
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </n-space>
        </n-space>
      </div>
    </div>
  </transition>
  <n-modal v-if="isMobile()" v-model:show="mainStore.showPanel">
    <n-card
        :bordered="false"
        size="small"
        role="dialog"
        aria-modal="true">
      <div class="panel-header">
        <n-checkbox v-show="mainStore.panel.id !== 0" size="large" v-model:checked="mainStore.panel.isDone"
                    @update:checked="toggle" style="margin-right: 4px"></n-checkbox>
        <n-date-picker type="daterange" style="width: 70%" :default-value="mainStore.panelDate"
                       v-model:value="panelDate" :shortcuts="shortcuts" @update:value="changePicker">
          <template #date-icon>
            <span style="opacity: 0">1</span>
          </template>
        </n-date-picker>
        <div class="day-diff" v-if="mainStore.panel.dayDiff < 0 && mainStore.panel.id === 0" style="color: red">
          延期{{ Math.abs(mainStore.panel.dayDiff) }}天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id === 0"
             style="color: rgb(34, 197, 94);">今天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id === 0"
             style="color: rgb(34, 197, 94);">
          还剩{{ mainStore.panel.dayDiff }}天
        </div>

        <div class="day-diff" v-if="mainStore.panel.dayDiff < 0 && mainStore.panel.id !== 0" style="color: red">
          延期{{ Math.abs(mainStore.panel.dayDiff) }}天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id !== 0"
             style="color: rgb(34, 197, 94);">今天截止
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id !== 0"
             style="color: rgb(34, 197, 94);">
          还剩{{ mainStore.panel.dayDiff }}天
        </div>
        <n-button text @click="mainStore.showPanel = false">
          <template #icon>
            <n-icon>
              <Close/>
            </n-icon>
          </template>
        </n-button>
      </div>
      <div style="height: 1px; margin: 8px 0;color: rgb(243 244 246 / 1);background-color: rgb(243 244 246 / 1)"></div>
      <div class="panel-body">
        <n-space align="center" style="margin-bottom: 4px">
          <n-space align="center" justify="center">
            持续时间
            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.planStartTime" placeholder="开始时间" default-formatted-value="00:00:00" size="small"></n-time-picker>
            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.planEndTime" placeholder="结束时间" default-formatted-value="00:00:00" size="small"></n-time-picker>
          </n-space>
        </n-space>
        <n-space align="center" style="margin-bottom: 4px">
          <n-space align="center" justify="center">
            邮件提醒
            <n-switch v-model:value="mainStore.panel.enableEmail"/>
          </n-space>
        </n-space>
        <n-space v-if="mainStore.panel.enableEmail" align="center">
          <n-space align="center">
            提醒类型
            <n-select size="small" :options="NoticeTypeOptions" v-model:value="mainStore.panel.noticeType" style="width: 100px"></n-select>
            <n-select v-show="NoticeTypeOptions.find(item => item.value === mainStore.panel.noticeType).child.length !== 0" size="small" :options="NoticeTypeOptions.find(item => item.value === mainStore.panel.noticeType).child" v-model:value="mainStore.panel.cronNum" style="width: 100px"></n-select>
          </n-space>
<!--          <n-space justify="center">-->
<!--            提醒时间-->
<!--            <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="mainStore.panel.predictTime" placeholder="预计开始时间" default-formatted-value="00:00:00" size="small"></n-time-picker>-->
<!--          </n-space>-->
        </n-space>
        <n-space justify="space-between" v-if="mainStore.panel.id !== 0" style="margin-bottom: 4px">
          <n-space justify="start" align="center">
            <n-button v-if="mainStore.panel.startDoTime === null" size="tiny" @click="startTodo">开始</n-button>
            <div v-else>开始: {{mainStore.panel.startDoTime.replace('T', ' ')}}</div>
          </n-space>
          <n-space justify="start" align="center">
            <n-button v-if="mainStore.panel.endDoTime === null && mainStore.panel.startDoTime" size="tiny" @click="endTodo">结束</n-button>
            <div v-if="mainStore.panel.endDoTime !== null && mainStore.panel.startDoTime">结束: {{mainStore.panel.endDoTime.replace('T', ' ')}}</div>
          </n-space>
        </n-space>
        <n-space v-if="mainStore.panel.endDoTime && mainStore.panel.startDoTime">总计: {{period}}</n-space>
        <n-space vertical justify="space-around">
          <n-input placeholder="准备做点什么" v-model:value="mainStore.panel.title"/>
          <n-input
              placeholder="描述"
              type="textarea"
              v-model:value="mainStore.panel.detail"
              :autosize="{
                minRows: 4,
                maxRows: 4
              }"
          ></n-input>
          <n-space>
            <n-space>
              <n-select v-model:value="mainStore.panel.taskBoxId" size="small" style="width: 200px" :options="mainStore.taskListOptions"/>
            </n-space>
          </n-space>
          <n-space justify="space-between">
            <n-space>
              <n-select v-model:value="mainStore.panel.priority" size="small" style="width: 150px" :options="options"/>
            </n-space>
            <n-space justify="end" align="center">
              <n-button size="small" type="success" @click="saveTodo">保存</n-button>
              <n-button text type="error" v-if="mainStore.panel.id !== 0" size="small" @click="remove">
                <template #icon>
                  <n-icon :size="20">
                    <Trash/>
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </n-space>
        </n-space>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup>
import {
  NInput,
  NSpace,
  NDatePicker,
  NButton,
  NIcon,
  NSelect,
  NCheckbox,
  NTimePicker,
  useMessage,
  NSwitch,
  NModal,
  NCard
} from 'naive-ui'
import {useMainStore} from "@/store";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {computed, customRef} from "vue";
import {
  DateFormat,
  DateTimeFormat,
  EndTodoURL,
  NoticeTypeOptions,
  options,
  StartTodoURL
} from "@/utils/Constant";
import {removeTodo, save, toggleDone, update,} from '@/utils/apiUtils'
import {Close, Trash} from "@vicons/ionicons5";
import request from "@/utils/request";
import {isMobile} from "@/utils/mobileUtils";

const mainStore = useMainStore()

const message = useMessage()
const period = computed(() => {
  if (mainStore.panel.startDoTime === null || mainStore.panel.endDoTime === null) {
    return 0
  }
  let seconds = dayjs(mainStore.panel.endDoTime).diff(dayjs(mainStore.panel.startDoTime), "seconds")
  const days = Math.floor(seconds / 86400)
  let string = ""
  if (days > 0) {
    seconds -= days * 86400
    string += `${days}天 `
  }

  const hours = Math.floor(seconds / 3600)
  if (hours > 0) {
    seconds -= hours * 3600
    string += `${hours}时 `
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) {
    seconds -= minutes * 60
    string += `${minutes}分 `
  }
  string += `${seconds}秒`
  return string
})
const panelDate = customRef((track, trigger) => {
  return {
    get() {
      return mainStore.panelDate
    },
    set(newValue) {
      mainStore.panel.startTime = dayjs(new Date(newValue[0])).format(DateFormat)
      mainStore.panel.endTime = dayjs(new Date(newValue[1])).format(DateFormat)
      trigger() // 通知 Vue 触发更新
    },
  }
})

const shortcuts = {
  今天: () => {
    mainStore.panel.startTime = dayjs(new Date()).format(DateFormat)
    mainStore.panel.endTime = dayjs(new Date()).format(DateFormat)
    mainStore.panel.dayDiff = 0
  }
}

const changePicker = function (value) {
  try {
    mainStore.panel.startTime = dayjs(new Date(value[0])).format(DateFormat)
    mainStore.panel.endTime = dayjs(new Date(value[1])).format(DateFormat)
    mainStore.panel.dayDiff = dayjs(new Date(value[0])).diff(dayjs(new Date()), 'day')
  } catch (e) {
  }
}

function saveTodo() {
  if (mainStore.panel.id === 0) {
    save(mainStore.panel).then(res => {
      if (res.code === 0) {
        mainStore.panel.id = res.data
        message.success('操作成功')
        mainStore.data.push(JSON.parse(JSON.stringify(mainStore.panel)))
        mainStore.update()
        mainStore.showPanel = false
      } else {
        message.error(res.msg)
      }
    })
  } else {
    update(mainStore.panel).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
        mainStore.updateById(mainStore.panel.id, mainStore.panel)
      } else {
        message.error(res.msg)
      }
    })
  }
}

function remove() {
  removeTodo(mainStore.panel.id).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      mainStore.data.splice(mainStore.data.indexOf(mainStore.data.find(item => item.id === mainStore.selectedId)), 1)
      mainStore.update()
      mainStore.showPanel = false
    } else {
      message.error(res.msg)
    }
  })
}

function toggle() {
  toggleDone(mainStore.panel).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      let item = mainStore.data.find(item => item.id === mainStore.panel.id)
      item.isDone = !item.isDone
      mainStore.update()
    } else {
      message.error(res.msg)
    }
  })
}

function startTodo() {
  request.post(StartTodoURL + mainStore.panel.id).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      mainStore.panel.startDoTime = dayjs(new Date()).format(DateTimeFormat)
      let item = mainStore.data.find(item => item.id === mainStore.panel.id)
      item.startDoTime = dayjs(new Date()).format(DateTimeFormat)
      mainStore.update()
    } else {
      message.error(res.msg)
    }
  })
}

function endTodo() {
  request.post(EndTodoURL + mainStore.panel.id).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      mainStore.panel.endDoTime = dayjs(new Date()).format(DateTimeFormat)
      let item = mainStore.data.find(item => item.id === mainStore.panel.id)
      item.endDoTime = dayjs(new Date()).format(DateTimeFormat)
      mainStore.update()
    } else {
      message.error(res.msg)
    }
  })
}
</script>

<style scoped>
.panel {
  width: 366px;
  max-height: 386px;
  padding: 8px 12px;
  position: absolute;
  background-color: white;
  top: 0;
  left: 0;
  z-index: 900;
  border-radius: .25rem;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.5s;
}

.panel-header {
  display: flex;
  align-items: center;
}

.day-diff {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.fade-enter-active, .fade-leave-active {
  opacity: 1;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
