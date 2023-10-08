<script setup>
import {
  NSpace,
  NH2,
  NButton,
  NCard,
  NDatePicker,
  NEmpty,
  NList,
  NListItem,
  NModal,
  NInput,
  NSelect,
  NIcon, NCheckbox
} from 'naive-ui'
import {customRef, h, onMounted, reactive, ref} from "vue";
import request from "@/utils/request";
import {
  DateFormat,
  GetTodoByMonthURL,
  options
} from "@/utils/Constant";
import {removeTodo, save, toggleDone, update,} from '@/utils/apiUtils'
import dayjs from "dayjs";
import {useMainStore} from "@/store";
import {Trash} from "@vicons/ionicons5";
import {message} from "@/main";


const timestamp = ref((new Date()).getTime())
const date = ref((new Date()).getTime())
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
const mainStore = useMainStore()
const showAddModal = ref(false)
const showEditModal = ref(false)
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
const priority1 = reactive([])
const priority2 = reactive([])
const priority3 = reactive([])
const priority4 = reactive([])
const priority5 = reactive([])

const panelTemplate = {
  startTime: dayjs(new Date()).format(DateFormat),
  endTime: dayjs(new Date()).format(DateFormat),
  dayDiff: 0,
  title: '',
  detail: '',
  priority: 5,
  isDone: false,
  id: 0
}

function showAdd(priority) {
  let data = Object.assign({}, panelTemplate)
  data.priority = priority
  showPanel(data, 'add')
}

function init() {
  request.post(GetTodoByMonthURL, {
    startTime: dayjs((new Date(timestamp.value))).format(DateFormat),
    endTime: dayjs((new Date(timestamp.value))).format(DateFormat),
  }).then(res => {
    if (res.code === 0) {
      priority1.length = 0
      priority2.length = 0
      priority3.length = 0
      priority4.length = 0
      priority5.length = 0
      const list = res.data.list
      for (let i = 0; i < list.length; i++) {
        const data = list[i]
        if (data.priority === 1) {
          priority1.push(data)
        } else if (data.priority === 2) {
          priority2.push(data)
        } else if (data.priority === 3) {
          priority3.push(data)
        } else if (data.priority === 4) {
          priority4.push(data)
        } else if (data.priority === 5) {
          priority5.push(data)
        }
      }
    }
  })
}

function showPanel(data, modal) {
  Object.assign(mainStore.panel, data)
  mainStore.panel.dayDiff = dayjs(data.startTime).diff(dayjs(new Date()), 'day')
  if (modal === 'add') {
    showAddModal.value = true
  } else {
    showEditModal.value = true
  }
  date.value = timestamp.value
}

function show(value) {
  timestamp.value = new Date(value).getTime()
  init()
}

function updateDate(value) {
  try {
    mainStore.panel.startTime = dayjs(new Date(value)).format(DateFormat)
    mainStore.panel.endTime = dayjs(new Date(value)).format(DateFormat)
  } catch (e) {
  }
}

async function remove() {
  removeTodo(mainStore.panel.id).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      closeModal()
      init()
    } else {
      message.error(res.msg)
    }
  })
}

async function saveTodo() {
  if (mainStore.panel.id === 0) {
    save(mainStore.panel).then(res => {
      if (res.code === 0) {
        mainStore.panel.id = res.data
        message.success('操作成功')
        closeModal()
        init()
      } else {
        message.error(res.msg)
      }
    })
  } else {
    update(mainStore.panel).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
        closeModal()
        init()
      } else {
        message.error(res.msg)
      }
    })
  }
}

function toggle() {
  toggleDone(mainStore.panel).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      init()
    } else {
      message.error(res.msg)
    }
  })
}

function closeModal() {
  showEditModal.value = false
  showAddModal.value = false
}

onMounted(() => {
  init()
})
</script>

<template>
  <div style="position: relative">
    <n-space vertical @click="mainStore.showPanel = false">
      <n-space>
        <n-h2>时间</n-h2>
        <n-date-picker v-model:value="timestamp" @update:value="show"/>
      </n-space>
      <n-space justify="center" item-style="width: 48%">
        <n-card style="height: 250px" :title="h('span', {style: 'color: red'}, {default: () => '非常重要'})">
          <template #header-extra>
            <n-button @click="showAdd(1)">增加</n-button>
          </template>
          <n-list style="overflow-y: auto;height: 160px" hoverable clickable v-show="priority1.length !== 0">
            <n-list-item v-for="item in priority1" @click="showPanel(item, 'edit')" :key="item.id">
              {{ item.title }}
            </n-list-item>
          </n-list>
          <n-space v-show="priority1.length === 0" style="height: 100%" vertical justify="center" align="center">
            <n-empty description="暂无任务"/>
          </n-space>

        </n-card>
        <n-card style="height: 250px" :title="h('span', {style: 'color: green'}, {default: () => '非常紧急'})">
          <template #header-extra>
            <n-button @click="showAdd(3)">增加</n-button>
          </template>
          <n-list style="overflow-y: auto;height: 160px" hoverable clickable v-show="priority3.length !== 0">
            <n-list-item v-for="item in priority3" @click="showPanel(item, 'edit')" :key="item.id">
              {{ item.title }}
            </n-list-item>
          </n-list>
          <n-space v-show="priority3.length === 0" style="height: 100%" vertical justify="center" align="center">
            <n-empty description="暂无任务"/>
          </n-space>

        </n-card>
      </n-space>
      <n-space justify="center" item-style="width: 48%">
        <n-card style="height: 250px" title="紧急">
          <template #header-extra>
            <n-button @click="showAdd(4)">增加</n-button>
          </template>
          <n-list style="overflow-y: auto;height: 160px" hoverable clickable v-show="priority4.length !== 0">
            <n-list-item v-for="item in priority4" @click="showPanel(item, 'edit')" :key="item.id">
              {{ item.title }}
            </n-list-item>
          </n-list>
          <n-space v-show="priority4.length === 0" style="height: 100%" vertical justify="center" align="center">
            <n-empty description="暂无任务"/>
          </n-space>

        </n-card>
        <n-card style="height: 250px" title="重要">
          <template #header-extra>
            <n-button @click="showAdd(2)">增加</n-button>
          </template>
          <n-list style="overflow-y: auto;height: 160px" hoverable clickable v-show="priority2.length !== 0">
            <n-list-item v-for="item in priority2" @click="showPanel(item, 'edit')" :key="item.id">
              {{ item.title }}
            </n-list-item>
          </n-list>
          <n-space v-show="priority2.length === 0" style="height: 100%" vertical justify="center" align="center">
            <n-empty description="暂无任务"/>
          </n-space>

        </n-card>
      </n-space>
      <n-space justify="center" item-style="width: 48%">
        <n-card style="height: 250px" title="一般">
          <template #header-extra>
            <n-button @click="showAdd(5)">增加</n-button>
          </template>
          <n-list style="overflow-y: auto;height: 160px" hoverable clickable v-show="priority5.length !== 0">
            <n-list-item v-for="item in priority5" @click="showPanel(item, 'edit')" :key="item.id">
              {{ item.title }}
            </n-list-item>
          </n-list>
          <n-space v-show="priority5.length === 0" style="height: 100%" vertical justify="center" align="center">
            <n-empty description="暂无任务"/>
          </n-space>

        </n-card>
      </n-space>

    </n-space>
    <n-modal v-model:show="showAddModal">
      <n-card
          style="width: 600px"
          title="增加"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
      >
        <n-space vertical>
          <n-space>
            <n-date-picker disabled v-model:value="date" @update:value="updateDate" :shortcuts="shortcuts"/>
          </n-space>
          <n-space item-style="width: 100%">
            <n-input placeholder="请输入标题" v-model:value="mainStore.panel.title"/>
          </n-space>
          <n-space item-style="width: 100%">
            <n-input type="textarea" placeholder="请输入描述" v-model:value="mainStore.panel.detail"/>
          </n-space>
          <n-space justify="space-between">
            <n-space>
              <n-select v-model:value="mainStore.panel.priority" size="small" style="width: 150px" :options="options"/>
            </n-space>
            <n-space justify="end" align="center">
              <n-button size="small" type="success" @click="saveTodo">保存</n-button>
            </n-space>
          </n-space>
        </n-space>
      </n-card>
    </n-modal>

    <n-modal v-model:show="showEditModal">
      <n-card
          style="width: 600px"
          title="编辑"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
      >
        <n-space vertical>
          <n-space align="center">
            <n-checkbox v-show="mainStore.panel.id !== 0" size="large" v-model:checked="mainStore.panel.isDone"
                        @update:checked="toggle" style="margin-right: 4px"></n-checkbox>
            <n-date-picker disabled type="daterange" v-model:value="panelDate" :shortcuts="shortcuts"
                           @update:value="changePicker"/>
          </n-space>
          <n-space>
            <n-input placeholder="请输入标题" v-model:value="mainStore.panel.title"/>
          </n-space>
          <n-space item-style="width: 100%">
            <n-input type="textarea" placeholder="请输入描述" v-model:value="mainStore.panel.detail"/>
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
      </n-card>
    </n-modal>
  </div>

</template>

<style scoped>

</style>