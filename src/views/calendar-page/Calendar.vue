<template>
  <div id="calendar" style="position: relative">
    <n-space justify="end">
      <n-space>
        <n-date-picker v-model:formatted-value="date" format="yyyy-MM" type="month" @update:value="show"/>
      </n-space>
      <n-space>
        <n-button @click="showAddModal = true">批量新增</n-button>
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
    <n-grid :cols="7" :row="6" style="margin-top: 10px;position: relative" ref="calendar">
      <n-grid-item style="padding-left: 8px">周日</n-grid-item>
      <n-grid-item style="padding-left: 8px">周一</n-grid-item>
      <n-grid-item style="padding-left: 8px">周二</n-grid-item>
      <n-grid-item style="padding-left: 8px">周三</n-grid-item>
      <n-grid-item style="padding-left: 8px">周四</n-grid-item>
      <n-grid-item style="padding-left: 8px">周五</n-grid-item>
      <n-grid-item style="padding-left: 8px">周六</n-grid-item>
      <n-grid-item v-for="(item, index) in list">
        <CalendarItems :index="index" :item="item" :dataList="renderTodoList[index]" :key="item"/>
      </n-grid-item>
    </n-grid>
    <Panel @add="addTodo" @update="updateTodoById" @remove="removeTodoById" :data-list="todoList"/>
    <n-modal v-model:show="showAddModal">
      <n-card
          style="width: 600px;max-width: 100%"
          title="批量新增"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
      >
        <template #header-extra>
          <n-button text @click="showAddModal = false">
            <template #icon>
              <n-icon>
                <Close/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <n-space vertical>
          <n-space>
            <n-space>
              日期范围：
            </n-space>
            <n-space>
              <n-date-picker v-model:value="addData.timeRange" type="daterange" placeholder="开始日期"/>
            </n-space>
          </n-space>
          <n-space vertical>
            <n-space>
              开启邮件提醒：
            </n-space>
            <n-space>
              <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="addData.planStartTime" placeholder="开始时间" default-formatted-value="00:00:00"></n-time-picker>
              <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="addData.planEndTime" placeholder="结束时间" default-formatted-value="00:00:00"></n-time-picker>
            </n-space>
          </n-space>
          <n-space>
            <n-space>
              开启邮件提醒(持续时间即为提醒时间)：
            </n-space>
            <n-space>
              <n-switch v-model:value="addData.enableEmail"></n-switch>
            </n-space>
          </n-space>
          <n-space v-if="addData.enableEmail" justify="center" vertical>
            <n-space align="center">
              提醒类型
              <n-select :options="NoticeTypeOptions" v-model:value="addData.noticeType" style="width: 100px"></n-select>
              <n-select v-show="NoticeTypeOptions.find(item => item.value === addData.noticeType).child.length !== 0" :options="NoticeTypeOptions.find(item => item.value === addData.noticeType).child" v-model:value="addData.cronNum" style="width: 100px"></n-select>
            </n-space>
<!--            <n-space>-->
<!--              邮件提醒时间：-->
<!--            </n-space>-->
<!--            <n-space>-->
<!--              <n-time-picker value-format="HH:mm:ss" v-model:formatted-value="addData.predictTime" default-formatted-value="00:00:00" placeholder="预计开始时间"/>-->
<!--            </n-space>-->
          </n-space>
          <n-space>
            <n-space vertical>
              <n-space>生成周期：</n-space>
              <n-space>
                <n-select v-model:value="addData.generateType" style="width: 100px" :options="GenerateOptions"
                          @update:value="changeGenerateType"/>
                <n-select
                    v-show="GenerateOptions.find(item => item.value === addData.generateType).child.length !== 0"
                    v-model:value="addData.generateDateList" multiple style="width: 400px"
                    :options="GenerateOptions.find(item => item.value === addData.generateType).child"/>
              </n-space>
            </n-space>
          </n-space>
          <n-space vertical>
            <n-space vertical>
              <n-input placeholder="准备做点什么" v-model:value="addData.title"/>
              <n-input
                  placeholder="描述"
                  type="textarea"
                  v-model:value="addData.detail"
                  :autosize="{
                minRows: 4,
                maxRows: 4
              }"
              ></n-input>
            </n-space>
          </n-space>
          <n-space vertical>
            <n-space>请选择所属清单：</n-space>
            <n-select v-model:value="addData.taskBoxId" style="width: 400px" :options="mainStore.taskListOptions"/>
          </n-space>
          <n-space vertical>
            <n-space>请选择重要程度：</n-space>
            <n-select v-model:value="addData.priority" style="width: 400px" :options="options"/>
          </n-space>
          <n-space vertical>
            <n-space>请输入持续时间(单位:天)：</n-space>
            <n-space>
              <n-input-number
                  v-model:value="addData.duration"
                  placeholder="请输入持续时间"
                  :min="1"
              />
            </n-space>
          </n-space>
        </n-space>
        <template #footer>
          <n-button @click="batchGenerateTodo">确定</n-button>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import {
  NButton,
  NDatePicker,
  NGrid,
  NGridItem,
  NSpace,
  NIcon,
  NModal,
  NCard,
  NSelect,
  useMessage,
  NInput,
  NInputNumber,
  NTimePicker, NSwitch
} from 'naive-ui'
import {onBeforeUnmount, onMounted, provide, reactive, ref, watchEffect} from "vue"
import {getNextMonthDays, myDayjs as dayjs} from "@/utils/dayUtils";
import {ArrowForwardOutline, ArrowBackOutline, Close} from "@vicons/ionicons5";
import CalendarItems from "@/components/CalendarItems";
import {useMainStore} from "@/store";
import Panel from "@/components/Panel";
import {
  DateFormat,
  GetAllTaskBoxURL,
  GetTodoByMonthURL,
  GenerateOptions,
  GenerateTypeDay,
  BatchGenerateTodoURL, options, NoticeTypeOptions, DeleteTodoBatchURL, TODO_FUNC_KEY, DateMonthFormat
} from "@/utils/Constant";
import request from "@/utils/request";
import {getRenderEventList} from "@/utils/todoListSortUtils";


const date = ref(dayjs(new Date()).format(DateMonthFormat))
const calendar = ref(null)
const showAddModal = ref(false)
const mainStore = useMainStore()
const list = reactive([])
const key = ref(0)
const message = useMessage()
const addData = ref({
  timeRange: [new Date().getTime(), new Date().getTime()],
  generateType: GenerateTypeDay,
  generateDateList: [],
  title: '',
  detail: '',
  taskBoxId: null,
  priority: 5,
  duration: 1,
  predictTime: "00:00:00",
  enableEmail: false,
  noticeType: 1,
  cronNum: null,
})
const todoList = ref([])
const renderTodoList = ref([])
provide(TODO_FUNC_KEY, {
  updateTodoById,
  addTodo,
  removeTodoById,
})

watchEffect(async () => {
  const {renderList} = getRenderEventList(list, todoList.value)
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


function show(value) {
  date.value = new Date(value)
  initList()
}

function initList() {
  list.length = 0
  key.value += 1
  const month = dayjs(date.value)
  list.push(...getNextMonthDays(month.year(), month.month() + 1))
  init()
}

function backMonth() {
  date.value = dayjs(date.value).subtract(1, 'month').format(DateMonthFormat)
  initList()
}

function forwardMonth() {
  date.value = dayjs(date.value).add(1, 'month').format(DateMonthFormat)
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
      todoList.value = res.data.list
      const {renderList} = getRenderEventList(list, todoList.value)
      renderTodoList.value = renderList
    }
  })
}

function initTaskList() {
  request.get(GetAllTaskBoxURL).then(res => {
    if (res.code === 0) {
      mainStore.taskListOptions.length = 0
      mainStore.taskListOptions.push({
        label: '请选择所属清单',
        value: 0
      })
      for (let i = 0; i < res.data.taskBoxes.length; i++) {
        mainStore.taskListOptions.push({
          label: res.data.taskBoxes[i].name,
          value: res.data.taskBoxes[i].id
        })
      }
    } else {
      message.error(res.msg)
    }
  })
}

function changeGenerateType(value) {
  addData.value.generateDateList = []
}

function batchGenerateTodo() {
  const data = Object.assign({}, addData.value)
  data.startTime = dayjs(addData.value.timeRange[0]).format(DateFormat)
  data.endTime = dayjs(addData.value.timeRange[1]).format(DateFormat)

  if (data.title === '') {
    message.error('请输入事项名称')
    return
  }

  if (data.generateType !== GenerateTypeDay && data.generateDateList.length === 0) {
    message.error('当生成周期不为每天时 需要选择具体生成日期')
    return
  }

  request.post(BatchGenerateTodoURL, data).then(res => {
    if (res.code === 0) {
      initList()
      message.success('操作成功')
      showAddModal.value = false
    } else {
      message.error(res.msg)
    }
  })

}

const click = (e) => {
  mainStore.showPanel = false
  mainStore.selectedId = 0
}

const frameSelection = function (container, canSelectedElementClassName, selectedElementClassName, showSelDiv, mousedownCallBack = null, mousemoveCallBack = null, isScroll = false, isOffset = false) {
  let mouseDown = false
  container.addEventListener('mousedown', e => {
    mouseDown = true
    if (mousedownCallBack) {
      mousedownCallBack()
    }
    let canSelList = []
    let selectedList = []
    let fileNodes = document.getElementsByClassName(canSelectedElementClassName)
    for (let i = 0; i < fileNodes.length; i++) {
      if (fileNodes[i].className.indexOf(canSelectedElementClassName) !== -1) {
        fileNodes[i].className += ` ${canSelectedElementClassName}`
        canSelList.push(fileNodes[i])
      }
    }
    let isSelect = true
    let evt = e
    let startX = (evt.x || evt.clientX)
    let startY = (evt.y || evt.clientY)
    try {
      container.removeChild(document.getElementById('selDiv'))
    } catch (e) {
    }
    let selDiv = document.createElement('div')
    container.append(selDiv)
    selDiv.style = `position:absolute;width:0;height:0;font-size:0;margin:0;padding:0;border:1px solid #0099FF;background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);opacity:0.6;display:none;`
    selDiv.id = 'selDiv'
    selDiv.style.left = startX + "px"
    selDiv.style.top = startY + "px"
    let _x = null
    let _y = null
    clearEventBubble(evt)
    let startPoint = getRelativePositionInElement(evt.clientX, evt.clientY)
    const boundingClientRect = container.getBoundingClientRect()
    const totalHeight = container.scrollHeight
    const scrollTop = container.scrollTop
    const mouseMove = e => {
      if (mouseDown) {
        evt = e
        if (isSelect) {
          if (selDiv.style.display === "none") {
            selDiv.style.display = ""
          }
          _x = (evt.x || evt.clientX)
          _y = (evt.y || evt.clientY)
          let endPoint = getRelativePositionInElement(evt.clientX, evt.clientY)

          let maxHeight
          let maxWidth
          if (_x >= startX) {
            maxWidth = boundingClientRect.width + container.offsetLeft
            if (isOffset) {
              maxWidth -= startX
            }
          } else {
            maxWidth = boundingClientRect.width
          }

          if (_y > startY) {
            maxHeight = totalHeight
            if (isScroll) {
              maxHeight -= startY
              maxHeight -= scrollTop
            }
          } else {
            maxHeight = totalHeight - container.scrollTop
          }
          selDiv.style.maxHeight = maxHeight + 'px'
          selDiv.style.maxWidth = maxWidth + 'px'

          selDiv.style.left = Math.min(startPoint.x, endPoint.x) + "px"
          selDiv.style.top = Math.min(startPoint.y, endPoint.y) + "px"
          selDiv.style.width = Math.abs(startPoint.x - endPoint.x) + "px"
          selDiv.style.height = Math.abs(startPoint.y - endPoint.y) + "px"
          scrollOnDrag(evt.clientX, evt.clientY)
          // ---------------- 关键算法 ---------------------
          let selDivRect = selDiv.getBoundingClientRect()
          const left1 = selDivRect.left
          const right1 = selDivRect.left + selDivRect.width
          const top1 = selDivRect.top
          const bottom1 = selDivRect.top + selDivRect.height
          const width1 = selDivRect.width
          const height1 = selDivRect.height
          for (let i = 0; i < canSelList.length; i++) {
            const itemRect = canSelList[i].getBoundingClientRect()
            const left2 = itemRect.left
            const right2 = itemRect.left + itemRect.width
            const top2 = itemRect.top
            const bottom2 = itemRect.top + itemRect.height
            const width2 = itemRect.width
            const height2 = itemRect.height
            if (!(left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1 || width1 <= 0 || width2 <= 0 || height1 <= 0 || height2 <= 0)) {
              if (canSelList[i].className.indexOf(selectedElementClassName) === -1) {
                canSelList[i].className = canSelList[i].className + ` ${selectedElementClassName}`
              }
            } else {
              if (canSelList[i].className.indexOf(selectedElementClassName) !== -1) {
                canSelList[i].classList.remove(selectedElementClassName)
              }
            }
            if (mousemoveCallBack) {
              const selectedList = []
              for (let i = 0; i < canSelList.length; i++) {
                if (canSelList[i].className.indexOf(selectedElementClassName) !== -1) {
                  selectedList.push(canSelList[i])
                }
              }
              mousemoveCallBack(selectedList, canSelList)
            }


          }
        }
        clearEventBubble(evt)
      }
    }
    const mouseUp = e => {
      e.stopPropagation()
      e.preventDefault()
      mouseDown = false
      isSelect = false
      if (selDiv) {
        selDiv.style.display = 'none'
        for (let i = 0; i < canSelList.length; i++) {
          if (canSelList[i].className.indexOf(selectedElementClassName) !== -1) {
            selectedList.push(canSelList[i])
          }
        }
        showSelDiv(selectedList, canSelList)
      }
      canSelList = null
      selectedList = null
      _x = null
      _y = null
      selDiv = null
      startX = null
      startY = null
      evt = null
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)
    }
    document.addEventListener('mousemove', mouseMove)

    document.addEventListener('mouseup', mouseUp)
  })

  function clearEventBubble(evt) {
    if (evt.stopPropagation)
      evt.stopPropagation()
    else {
      evt.cancelBubble = true
    }
    if (evt.preventDefault) {
      evt.preventDefault()
    } else {
      evt.returnValue = false
    }
  }

  function getRelativePositionInElement(clientX, clientY) {
    const rect = container.getBoundingClientRect()
    const {left, top} = rect
    const {scrollLeft, scrollTop, scrollWidth, scrollHeight} = container
    let x = clientX - left + scrollLeft
    let y = clientY - top + scrollTop
    if (x < 0) {
      x = 0
    } else if (x > scrollWidth) {
      x = scrollWidth
    }

    if (y < 0) {
      y = 0
    } else if (y > scrollHeight) {
      y = scrollHeight
    }

    return {x: Math.round(x), y: Math.round(y)}
  }

  function scrollOnDrag(mouseX, mouseY) {
    const {x, y, width, height} = container.getBoundingClientRect()
    let scrollX, scrollY

    if (mouseX < x) {
      scrollX = mouseX - x
    } else if (mouseX > (x + width)) {
      scrollX = mouseX - (x + width)
    }

    if (mouseY < y) {
      scrollY = mouseY - y
    } else if (mouseY > (y + height)) {
      scrollY = mouseY - (y + height)
    }

    if (scrollX || scrollY) {
      container.scrollBy({
        top: scrollY,
        behavior: 'auto'
      })
    }
  }

  document.body.addEventListener('dragover', ev => {
    ev.preventDefault()
  })
}


function keyDown(e) {
  if (e.keyCode === 17) {
    mainStore.keyDown = true
  } else if (e.keyCode === 18) {
    mainStore.altDown = true
  }
}

function keyUp(e) {
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

onMounted(() => {
  initList()
  initTaskList()
  document.querySelector('#calendar').addEventListener('click', click)
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)
  frameSelection(calendar.value.$el, 'content', 'selected', (selectedList, totalList) => {
    mainStore.selectedIds.length = 0
    for (let i = 0; i < selectedList.length; i++) {
      const id = selectedList[i].id
      if (mainStore.selectedIds.indexOf(id) === -1) {
        mainStore.selectedIds.push(id)
      }
    }
  }, () => {
    mainStore.selectedIds.length = 0
    mainStore.selectedId = ''
  })
})

onBeforeUnmount(() => {
  document.querySelector('#calendar').removeEventListener('click', click)
  window.removeEventListener('keydown', keyDown)
  window.removeEventListener('keyup', keyUp)
})
</script>

<style scoped>

</style>
