<template>
  <transition name="fade">
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
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id === 0" style="color: rgb(34, 197, 94);">今天</div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id === 0" style="color: rgb(34, 197, 94);">
          后面{{ mainStore.panel.dayDiff }}天
        </div>

        <div class="day-diff" v-if="mainStore.panel.dayDiff < 0 && mainStore.panel.id !== 0" style="color: red">
          延期{{ Math.abs(mainStore.panel.dayDiff) }}天
        </div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff === 0 && mainStore.panel.id !== 0" style="color: rgb(34, 197, 94);">今天截止</div>
        <div class="day-diff" v-if="mainStore.panel.dayDiff > 0 && mainStore.panel.id !== 0" style="color: rgb(34, 197, 94);">
          还有{{ mainStore.panel.dayDiff }}天
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
</template>

<script setup>
import {NInput, NSpace, NDatePicker, NButton, NIcon, NSelect, NCheckbox, useMessage} from 'naive-ui'
import {useMainStore} from "@/store";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {customRef} from "vue";
import {DateFormat, options} from "@/utils/Constant";
import {removeTodo, save, toggleDone, update,} from '@/utils/apiUtils'
import {Close, Trash} from "@vicons/ionicons5";

const mainStore = useMainStore()

const message = useMessage()
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
        mainStore.dataList.push(Object.assign({}, mainStore.panel))
        message.success('操作成功')
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
        Object.assign(mainStore.dataList.find(item => item.id === mainStore.panel.id), mainStore.panel)
        mainStore.update()
        mainStore.showPanel = false
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
      mainStore.dataList.splice(mainStore.dataList.indexOf(mainStore.dataList.find(item => item.id === mainStore.selectedId)), 1)
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
      let item = mainStore.dataList.find(item => item.id === mainStore.panel.id)
      item.isDone = !item.isDone
    } else {
      message.error(res.msg)
    }
  })
}
</script>

<style scoped>
.panel {
  width: 366px;
  height: 234px;
  padding: 8px 12px;
  position: absolute;
  background-color: white;
  top: 0;
  left: 0;
  z-index: 100;
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