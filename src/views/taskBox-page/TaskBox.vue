<script setup>
import {
  NIcon,
  NButton,
  NModal,
  NCard,
  NInput,
  NScrollbar,
  NEllipsis,
  NDropdown,
  useMessage,
  NEmpty,
  NSpace, NCheckbox, NDatePicker, NSelect,
} from 'naive-ui'
import {Add, Close, FolderOutline, EllipsisVerticalSharp, Trash} from "@vicons/ionicons5";
import {computed, customRef, onMounted, reactive, ref} from "vue";
import request from "@/utils/request";
import {
  AddTaskBoxURL, DateFormat,
  GetAllTaskBoxURL,
  GetTodoByTaskBoxIdURL,
  RemoveTaskBoxByIdURL,
  UpdateTaskBoxURL,
  options as todoOptions
} from "@/utils/Constant";
import {removeTodo as removeTodoItem, toggleDone, update as updateTodo, save as addTodoItem} from "@/utils/apiUtils";
import {myDayjs as dayjs} from "@/utils/dayUtils";

const showModal = ref(false)
const title = ref('')
const searchKeyword = ref('')
const message = useMessage()
const activeListIndex = ref(null)
const activeTodoIndex = ref(null)
const todo = ref(null)
const listInfo = ref({
  id: '',
  name: ''
})
const taskList = reactive([])
const todoList = reactive([])
const options = [
  {
    label: "编辑",
    key: "update",
    style: {
      color: 'yellow'
    },
    props: {
      onClick: (e) => {
        const id = e.target.parentNode.parentNode.parentNode.getAttribute('data')
        showModalFunc('编辑清单')
        listInfo.value.name = taskList.find(item => item.id === id).name
        listInfo.value.id = id
      }
    }
  },
  {
    label: "删除",
    key: "remove",
    style: {
      color: 'red'
    },
    props: {
      onClick: (e) => {
        const id = e.target.parentNode.parentNode.parentNode.getAttribute('data')
        remove(id)
      }
    }
  },
]
const dayDiff = ref(0)
const addTodoInfo = ref({
  startTime: dayjs(new Date()).format(DateFormat),
  endTime: dayjs(new Date()).format(DateFormat),
  dayDiff: 0,
  title: '',
  detail: '',
  priority: 5,
  taskBoxId: 0,
  isDone: false,
})
const taskListOptions = []
const computedTaskList = computed(() => taskList.filter((data, index, arr) => data?.name.indexOf(searchKeyword.value) !== -1))

const panelDate = customRef((track, trigger) => {
  return {
    get() {
      return [new Date(todo.value.startTime).getTime(), new Date(todo.value.endTime).getTime()]
    },
    set(newValue) {
      todo.value.startTime = dayjs(new Date(newValue[0])).format(DateFormat)
      todo.value.endTime = dayjs(new Date(newValue[1])).format(DateFormat)
      trigger() // 通知 Vue 触发更新
    },
  }
})
const shortcuts = {
  今天: () => {
    todo.value.startTime = dayjs(new Date()).format(DateFormat)
    todo.value.endTime = dayjs(new Date()).format(DateFormat)
    dayDiff.value = 0
  }
}

const changePicker = function (value) {
  try {
    todo.startTime = dayjs(new Date(value[0])).format(DateFormat)
    todo.endTime = dayjs(new Date(value[1])).format(DateFormat)
    dayDiff.value = dayjs(new Date(value[0])).diff(dayjs(new Date()), 'day')
  } catch (e) {
  }
}


function addOrUpdate() {
  if (listInfo.value.id === '') {
    add()
  } else {
    update()
  }
}


function add() {
  request.post(AddTaskBoxURL, listInfo.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      showModal.value = false
      init()
    } else {
      message.error(res.msg)
    }
  })
}

function update() {
  request.post(UpdateTaskBoxURL, listInfo.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      showModal.value = false
      init()
    } else {
      message.error(res.msg)
    }
  })
}

function remove(id) {
  request.get(RemoveTaskBoxByIdURL + id).then(res => {
    if (res.code === 0) {
      if (activeListIndex.value === id) {
        activeListIndex.value = null
      }
      message.success('操作成功')
      showModal.value = false
      init()
    } else {
      message.error(res.msg)
    }
  })
}

function getTodo(taskBoxId) {
  activeListIndex.value = taskBoxId
  todoList.length = 0
  request.get(GetTodoByTaskBoxIdURL + taskBoxId).then(res => {
    if (res.code === 0) {
      todoList.push(...res.data.todos)
    } else {
      message.error(res.msg)
    }
  })
}

function showDetail(item) {
  todo.value = item
  activeTodoIndex.value = item.id
}

function init() {
  request.get(GetAllTaskBoxURL).then(res => {
    if (res.code === 0) {
      taskList.length = 0
      taskList.push(...res.data.taskBoxes)
      taskListOptions.length = 0
      for (let i = 0; i < taskList.length; i++) {
        taskListOptions.push({
          label: taskList[i].name,
          value: taskList[i].id
        })
      }
    } else {
      message.error(res.msg)
    }
  })
}

function showModalFunc(name) {
  if (name === '创建清单') {
    listInfo.value = {
      id: '',
      name: ''
    }
  }

  title.value = name
  showModal.value = true
}


function toggle() {
  toggleDone(todo.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
    } else {
      message.error(res.msg)
    }
  })
}

function saveTodo() {
  updateTodo(todo.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      getTodo(activeListIndex.value)
    } else {
      message.error(res.msg)
    }
  })
}

function addTodo() {
  addTodoInfo.value.taskBoxId = activeListIndex.value
  addTodoItem(addTodoInfo.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      getTodo(activeListIndex.value)
    } else {
      message.error(res.msg)
    }
  })
}

function removeTodo() {
  removeTodoItem(todo.value.id).then(res => {
    if (res.code === 0) {
      todo.value = null
      message.success('操作成功')
      getTodo(activeListIndex.value)
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
  <div class="container">
    <div class="container-item">
      <div class="container-item-header">
        <div class="title">清单列表</div>
        <div class="title">
          <n-button circle size="tiny" strong secondary @click="showModalFunc('创建清单')">
            <template #icon>
              <n-icon>
                <Add/>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
      <n-input placeholder="请输入清单名称" v-model:value="searchKeyword"/>
      <n-scrollbar style="height: calc(100% - 50px)">
        <div v-if="computedTaskList.length > 0" class="task-item" @click="getTodo(item.id)" v-for="(item, index) in computedTaskList"
             :class="[
            activeListIndex === item.id ? 'active' : ''
        ]">
          <div class="task-item-icon">
            <n-icon size="18">
              <FolderOutline/>
            </n-icon>
          </div>
          <div class="task-item-content">
            <n-ellipsis style="max-width: 100%">
              {{ item.name }}
            </n-ellipsis>
          </div>
          <div class="task-item-option">
            <n-dropdown trigger="hover" :options="options" :data="item.id">
              <n-icon size="14">
                <EllipsisVerticalSharp/>
              </n-icon>
            </n-dropdown>
          </div>
        </div>
        <n-space justify="center" align="center" style="height: calc(100vh - 180px)">
          <n-empty v-if="taskList.length === 0" description="暂无清单">
            <template #extra>
              <n-button size="small" @click="showModalFunc('创建清单')">
                创建
              </n-button>
            </template>
          </n-empty>
        </n-space>
      </n-scrollbar>
    </div>
    <div class="container-item">
      <n-input v-if="activeListIndex !== null" placeholder="请输入任务, 回车保存" v-model:value="addTodoInfo.title" @keydown.enter="addTodo"/>
      <n-scrollbar style="height: calc(100% - 20px)">
        <div v-if="todoList.length > 0" :class="[
            activeTodoIndex === item.id ? 'active' : ''
        ]" class="todo-item" v-for="item in todoList" @click="showDetail(item)">{{ item.title }}
        </div>
        <n-space justify="center" align="center" style="height: calc(100vh - 180px)">
          <n-empty v-if="todoList.length === 0" description="暂无事项"></n-empty>
        </n-space>
      </n-scrollbar>
    </div>
    <div class="container-item">
      <div v-if="todo !== null" class="panel">
        <div class="panel-header">
          <n-checkbox size="large" v-model:checked="todo.isDone"
                      @update:checked="toggle" style="margin-right: 4px"></n-checkbox>
          <n-date-picker type="daterange" style="width: 70%" :default-value="panelDate"
                         v-model:value="panelDate" :shortcuts="shortcuts" @update:value="changePicker">
            <template #date-icon>
              <span style="opacity: 0">1</span>
            </template>
          </n-date-picker>
          <div class="day-diff" v-if="dayDiff < 0" style="color: red">延期{{ Math.abs(dayDiff) }}天</div>
          <div class="day-diff" v-if="dayDiff === 0" style="color: rgb(34, 197, 94);">今天</div>
          <div class="day-diff" v-if="dayDiff > 0" style="color: rgb(34, 197, 94);">后面{{ dayDiff }}天</div>
        </div>
        <div style="height: 1px; margin: 8px 0;color: rgb(243 244 246 / 1);background-color: rgb(243 244 246 / 1)"></div>
        <div class="panel-body">
          <n-space vertical justify="space-around">
            <n-input placeholder="准备做点什么" v-model:value="todo.title"/>
            <n-input
                placeholder="描述"
                type="textarea"
                v-model:value="todo.detail"
                :autosize="{
                minRows: 4,
                maxRows: 4
              }"
            ></n-input>
            <n-space>
              <n-space>
                <n-select v-model:value="todo.taskBoxId" size="small" style="width: 200px" :options="taskListOptions"/>
              </n-space>
            </n-space>
            <n-space justify="space-between">
              <n-space>
                <n-select v-model:value="todo.priority" size="small" style="width: 150px" :options="todoOptions"/>
              </n-space>
              <n-space align="center">
                <n-button size="small" type="success" @click="saveTodo">保存</n-button>
                <n-button text type="error" size="small" @click="removeTodo">
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
    </div>
  </div>
  <n-modal v-model:show="showModal">
    <n-card
        style="width: 600px"
        :title="title"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #header-extra>
        <n-button circle size="small" strong secondary @click="showModal = false">
          <template #icon>
            <n-icon>
              <Close/>
            </n-icon>
          </template>
        </n-button>
      </template>
      <n-input placeholder="请输入清单名称" v-model:value="listInfo.name"/>
      <template #footer>
        <n-button @click="addOrUpdate">确定</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.container {
  display: flex;
  height: calc(100vh - 90px);
}

.container-item {
  flex: 1.5;
  padding: 10px;
}

.container-item:nth-child(1) {
  flex: 1;
}

.container-item:nth-child(2) {
  border-left: 1px solid rgb(229 231 235 / 1);
  border-right: 1px solid rgb(229 231 235 / 1);
}

.container-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-item {
  margin-top: 6px;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  padding: 4px;
  transition: .3s;
}

.task-item > div {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-item > .task-item-content {
  flex: 6;
  justify-content: start;
}

.task-item:hover {
  background-color: #e7f7ee;
}

.active {
  background-color: #edfdf3;
}

.todo-item {
  margin-top: 6px;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  padding: 4px 10px;
  transition: .3s;
}

.todo-item:hover {
  background-color: #e7f7ee;
}

.panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
}

.day-diff {
  margin-left: 10px;
}
</style>