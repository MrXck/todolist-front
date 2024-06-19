<script setup>
import {
  NButton,
  NCard,
  NDatePicker,
  NH2,
  NIcon,
  NInput,
  NModal,
  NSpace,
  NTimePicker,
  useMessage
} from 'naive-ui'
import {onMounted, reactive, ref} from "vue";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import request from "@/utils/request";
import {
  AddTimeThingURL,
  DateFormat,
  GetTimeThingByDateURL,
  RemoveTimeThingByIdURL,
  TimeFormat,
  UpdateTimeThingURL
} from "@/utils/Constant";
import {Close, Trash, CreateOutline} from "@vicons/ionicons5";

const message = useMessage()
const timestamp = ref((new Date()).getTime())
const showAddModal = ref(false)
const showUpdateModal = ref(false)
const addData = ref({
  title: '',
  startTime: '00:00:00',
  endTime: '00:00:00',
  content: '',
  thingTime: dayjs((new Date(timestamp.value))).format(DateFormat),
})
const updateData = ref({
  id: '',
  title: '',
  startTime: '00:00:00',
  endTime: '00:00:00',
  content: '',
  thingTime: dayjs((new Date(timestamp.value))).format(DateFormat),
})
const dataList = reactive([])

function show(value) {
  timestamp.value = new Date(value).getTime()
  addData.value.thingTime = dayjs((new Date(value))).format(DateFormat)
  init()
}

function init() {
  request.post(GetTimeThingByDateURL, {
    thingDate: dayjs((new Date(timestamp.value))).format(DateFormat)
  }).then(res => {
    if (res.code === 0) {
      dataList.length = 0
      dataList.push(...res.data.timeThings)
    }
  })
}

function addTimeThing() {
  const startTime = dayjs(addData.value.startTime, TimeFormat)
  const endTime = dayjs(addData.value.endTime, TimeFormat)
  if (!startTime.isBefore(endTime)) {
    message.error("开始时间不能大于结束时间")
    return
  }

  request.post(AddTimeThingURL, addData.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      showAddModal.value = false
      init()
    } else {
      message.error(res.msg)
    }
  })
}

function updateTimeThing() {
  const startTime = dayjs(updateData.value.startTime, TimeFormat)
  const endTime = dayjs(updateData.value.endTime, TimeFormat)
  if (!startTime.isBefore(endTime)) {
    message.error("开始时间不能大于结束时间")
    return
  }

  request.put(UpdateTimeThingURL, updateData.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      showUpdateModal.value = false
      init()
    } else {
      message.error(res.msg)
    }
  })

}

function updateModal(item) {
  updateData.value = item
  const data = {}
  Object.assign(data, item)
  updateData.value = data
  showUpdateModal.value = true
}

function remove(id) {
  request.delete(RemoveTimeThingByIdURL + id).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      init()
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
    <n-space vertical>
      <n-space>
        <n-h2>时间</n-h2>
        <n-date-picker v-model:value="timestamp" @update:value="show"/>
        <n-button @click="showAddModal = true">新增</n-button>
      </n-space>
      <n-space vertical style="gap: 0">
        <n-space vertical v-for="item in dataList">
          <div class="item-content">
            <div class="icon"></div>
            <div class="line"></div>
            <div class="ic"></div>
            <div class="content">
              <div class="time">
                <div class="time-left">{{ dayjs(item.startTime, TimeFormat).format(TimeFormat) }} —
                  {{ dayjs(item.endTime, TimeFormat).format(TimeFormat) }}
                </div>
                <div class="time-right">
                  {{ Math.round(dayjs(item.endTime, TimeFormat).diff(dayjs(item.startTime, TimeFormat)) / 1000 / 60) }}m
                  <n-button text style="margin: 0 4px" type="info" size="small" @click="updateModal(item)">
                    <template #icon>
                      <n-icon :size="14">
                        <CreateOutline/>
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text type="error" size="small" @click="remove(item.id)">
                    <template #icon>
                      <n-icon :size="14">
                        <Trash/>
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
              <div class="title">{{ item.title }}</div>
              <div class="desc">{{ item.content }}</div>
            </div>
          </div>
        </n-space>
      </n-space>
    </n-space>
  </div>
  <n-modal v-model:show="showAddModal">
    <n-card
        style="width: 600px;max-width: 100%"
        title="新增"
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
          <n-date-picker disabled v-model:formatted-value="addData.thingTime" :value-format="'yyyy-MM-dd'"/>
        </n-space>
        <n-space>
          开始时间：
        </n-space>
        <n-space>
          <n-time-picker :value-format="TimeFormat" default-formatted-value="00:00:00" v-model:formatted-value="addData.startTime" placeholder="开始时间"/>
        </n-space>
        <n-space>
          结束时间：
        </n-space>
        <n-space>
          <n-time-picker :value-format="TimeFormat" default-formatted-value="00:00:00" v-model:formatted-value="addData.endTime" placeholder="结束时间"/>
        </n-space>
        <n-space vertical>
          <n-space vertical>
            <n-input placeholder="准备做点什么" v-model:value="addData.title"/>
            <n-input
                placeholder="描述"
                type="textarea"
                v-model:value="addData.content"
                :autosize="{
                minRows: 4,
                maxRows: 4
              }"
            ></n-input>
          </n-space>
        </n-space>

      </n-space>
      <template #footer>
        <n-button @click="addTimeThing">确定</n-button>
      </template>
    </n-card>
  </n-modal>
  <n-modal v-model:show="showUpdateModal">
    <n-card
        style="width: 600px;max-width: 100%"
        title="修改"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #header-extra>
        <n-button text @click="showUpdateModal = false">
          <template #icon>
            <n-icon>
              <Close/>
            </n-icon>
          </template>
        </n-button>
      </template>
      <n-space vertical>
        <n-space>
          <n-date-picker disabled v-model:formatted-value="updateData.thingTime" :value-format="'yyyy-MM-dd'"/>
        </n-space>
        <n-space>
          开始时间：
        </n-space>
        <n-space>
          <n-time-picker :value-format="TimeFormat" default-formatted-value="00:00:00" v-model:formatted-value="updateData.startTime" placeholder="开始时间"/>
        </n-space>
        <n-space>
          结束时间：
        </n-space>
        <n-space>
          <n-time-picker :value-format="TimeFormat" default-formatted-value="00:00:00" v-model:formatted-value="updateData.endTime" placeholder="结束时间"/>
        </n-space>
        <n-space vertical>
          <n-space vertical>
            <n-input placeholder="准备做点什么" v-model:value="updateData.title"/>
            <n-input
                placeholder="描述"
                type="textarea"
                v-model:value="updateData.content"
                :autosize="{
                minRows: 4,
                maxRows: 4
              }"
            ></n-input>
          </n-space>
        </n-space>

      </n-space>
      <template #footer>
        <n-button @click="updateTimeThing">确定</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.line {
  width: 2px;
  background-color: black;
  height: 100%;
  position: absolute;
  left: 12px;
}

.icon {
  position: absolute;
  top: 4px;
  left: 6px;
  background-color: white;
  border: 2px solid blue;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 99;
}

.item-content {
  position: relative;
  display: flex;
}

.ic {
  position: absolute;
  top: calc(100% - 50%);
  left: 8px;
  background-color: white;
  border: 2px solid blue;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.content {
  padding: 4px 10px;
  margin-bottom: 10px;
  margin-left: 26px;
  margin-right: 10px;
  border-radius: 4px;
  flex: 1;
}

.time {
  color: #a9a9a9;
  display: flex;
  justify-content: space-between;
}

.time-right {
  display: flex;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.desc {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  word-break: break-all;
  color: #848484;
}
</style>
