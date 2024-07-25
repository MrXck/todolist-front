<script setup>
import {NScrollbar, useMessage} from 'naive-ui'
import CalendarDetailItem from "@/components/CalendarDetailItem.vue";
import {onMounted, reactive, ref} from "vue";
import {useDrop} from "@/utils/dragUtils";
import {myDayjs as dayjs} from "@/utils/dayUtils";
import {useMainStore} from "@/store";
import {DateFormat, TimeFormat, UpdateTodoByIdURL} from "@/utils/Constant";
import request from "@/utils/request";

const {timeHeight, index, date, dataList} = defineProps({
  timeHeight: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  dataList: {
    type: Array,
  }
})

const itemsRef = ref()
const timeList = reactive([])
const message = useMessage()
const mainStore = useMainStore()

function init() {
  timeList.length = 0
  for (let i = 0; i < 24; i++) {
    const hour = `${i.toString().padStart(2, '0')}`
    let num = 0
    const startTime = `${hour}:00:00`
    const endTime = `${hour}:59:59`
    const list = []

    if (dataList && dataList.length > 0) {
      dataList.map(item => {
        const dateStart = dayjs(`${date} ${startTime}`)
        const dateEnd = dayjs(`${date} ${endTime}`)
        const dataStart = dayjs(`${item.startTime} ${item.planStartTime}`)
        const dataEnd = dayjs(`${item.endTime} ${item.planEndTime}`)

        if (!item.planStartTime || !item.planEndTime) {
          if (startTime === '00:00:00') {
            list.push({
              data: item,
              num
            })
            num += 1
          }
        } else {
          const isShow =
              dateStart.isBetween(dataStart, dataEnd, null, [])
              ||
              dateEnd.isBetween(dataStart, dataEnd, null, [])
              ||
              (dateStart.isBefore(dataEnd) && dateEnd.isAfter(dataStart))
          if (isShow) {
            list.push({
              data: item,
              num
            })
            num += 1
          }
        }
      })
    }

    timeList.push({
      startTime,
      endTime,
      list
    })
  }
}

onMounted(() => {
  init()

  itemsRef.value.map(node => {
    useDrop({
      accept: ['before', 'after', 'move'],
      node,
      drop: (e, item, type) => {
        const data = item.data
        const id = data.id
        const rect = node.getBoundingClientRect()
        const hour = node.getAttribute('data-hour');
        const minute = Math.ceil((e.clientY - rect.top) / (rect.height) * 60)
        const newBeforeDateTime = dayjs(`${date} ${hour}:${minute}:00`)
        const oldBeforeDateTime = dayjs(`${data.startTime} ${data.planStartTime ? data.planStartTime : data.predictTime}`)
        const newAfterDateTime = dayjs(`${date} ${hour}:${minute}:00`)
        const oldAfterDateTime = dayjs(`${data.endTime} ${data.planEndTime ? data.planEndTime : data.predictTime}`)
        if (type === 'before') {
          if (newBeforeDateTime.isAfter(oldAfterDateTime)) {
            message.error(`开始时间不能大于结束时间`)
          } else {
            data.planStartTime = newBeforeDateTime.format(TimeFormat)
            data.startTime = newBeforeDateTime.format(DateFormat)
          }
        } else if (type === 'after') {
          if (newAfterDateTime.isBefore(oldBeforeDateTime)) {
            message.error(`结束时间不能小于开始时间`)
          } else {
            data.planEndTime = newAfterDateTime.format(TimeFormat)
            data.endTime = newAfterDateTime.format(DateFormat)
          }
        } else if (type === 'move') {
          const second = oldAfterDateTime.diff(oldBeforeDateTime, 'second')
          data.planStartTime = newBeforeDateTime.format(TimeFormat)
          data.startTime = newBeforeDateTime.format(DateFormat)
          const afterDateTime = newBeforeDateTime.add(second, 'second')
          data.endTime = afterDateTime.format(DateFormat)
          data.planEndTime = afterDateTime.format(TimeFormat)
        }
        request.post(UpdateTodoByIdURL, data).then(res => {
          if (res.code === 0) {
            message.success('操作成功')
            mainStore.updateById(id, data)
          } else {
            message.error(res.msg)
          }
        })
      },
      hover: (e, item, type) => {

      },
      dropData: {
        date
      }
    })
  })
})
</script>

<template>
  <div :class="[
            'first',
            'calendar-detail-items',
            index !== 0 ? 'not-left-border' : ''
        ]">
    <div :class="[
        'time-period',
        index !== 0 ? 'top-border' : ''
    ]" v-for="(i, index) in 24" :data-hour="index" ref="itemsRef">
      <n-scrollbar trigger="hover" :style="`max-height: ${timeHeight}px`">
        <CalendarDetailItem v-if="timeList[index]?.list" v-for="item in timeList[index].list" :date="date"
                            :startTime="timeList[index].startTime"
                            :endTime="timeList[index].endTime" :data="item.data" :num="item.num"
                            :timeHeight="timeHeight"/>
      </n-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.calendar-detail-items {
  word-break: break-all;
  overflow: hidden;
  flex: 1;
}

.time-period {
  height: v-bind(timeHeight -1 + 'px');
}

.first {
  border: 1px solid rgb(229 231 235);
}

.top-border {
  border-top: 1px solid rgb(229 231 235);
}

.not-left-border {
  border-left: 0;
}

.not-top-border {
  border-top: 0;
}
</style>
