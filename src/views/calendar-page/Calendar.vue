<template>
  <div id="calendar" style="position: relative">
    <n-space justify="flex-end">
      <n-space>
        <n-date-picker v-model:value="date" type="month" @update:value="show"/>
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
    <n-grid :cols="7" :row="6" style="margin-top: 10px" ref="calendar">
      <n-grid-item style="padding-left: 8px">周日</n-grid-item>
      <n-grid-item style="padding-left: 8px">周一</n-grid-item>
      <n-grid-item style="padding-left: 8px">周二</n-grid-item>
      <n-grid-item style="padding-left: 8px">周三</n-grid-item>
      <n-grid-item style="padding-left: 8px">周四</n-grid-item>
      <n-grid-item style="padding-left: 8px">周五</n-grid-item>
      <n-grid-item style="padding-left: 8px">周六</n-grid-item>
      <n-grid-item v-for="(item, index) in list">
        <CalendarItems :index="index" :item="item" :dataList="mainStore.dataList[index]" :key="key"/>
      </n-grid-item>
    </n-grid>
    <Panel/>
    <n-modal v-model:show="showAddModal">
      <n-card
          style="width: 600px"
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
              开始日期：
            </n-space>
            <n-space>
              <n-date-picker v-model:value="addData.timeRange" type="daterange" placeholder="开始日期"/>
            </n-space>
<!--            <n-space vertical>-->
<!--              <n-space>-->
<!--                开始日期：-->
<!--              </n-space>-->
<!--              <n-space>-->
<!--                <n-date-picker v-model:value="addData.startTime" type="date" placeholder="开始日期"/>-->
<!--              </n-space>-->
<!--            </n-space>-->
<!--            <n-space vertical>-->
<!--              <n-space>-->
<!--                结束日期：-->
<!--              </n-space>-->
<!--              <n-space>-->
<!--                <n-date-picker v-model:value="addData.endTime" type="date" placeholder="结束日期"/>-->
<!--              </n-space>-->
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
  NInputNumber
} from 'naive-ui'
import {onMounted, reactive, ref, watch} from "vue"
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
  BatchGenerateTodoURL, options
} from "@/utils/Constant";
import request from "@/utils/request";


const date = ref(new Date())
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
})


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
  mainStore.dateList = list
  // getTodo(mainStore)

  request.post(GetTodoByMonthURL, {
    startTime: list[0].date,
    endTime: list[list.length - 1].date,
  }).then(res => {
    if (res.code === 0) {
      mainStore.dataList = res.data.list
      mainStore.data = res.data.list
      mainStore.update()
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

onMounted(() => {
  initList()
  initTaskList()
  document.querySelector('#calendar').addEventListener('click', (e) => {
    mainStore.showPanel = false
    mainStore.selectedId = 0
  })
})
</script>

<style scoped>

</style>