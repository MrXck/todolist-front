<template>
  <div :class="[
      'calendar-item-item',
  ]" ref="item" v-if="show">
    <Backend :data="data" v-if="data.startTime === fullDate" :full-date="fullDate"/>
    <div :id="data.id" @click="showPanel" :class="[
      'content',
      data.startTime === fullDate ? 'left-border' : '',
      data.endTime === fullDate ? 'right-border' : '',
      data.isDone ? 'done' : '',
      data.priority === 1 ? 'first' : '',
      data.priority === 2 ? 'second' : '',
      data.priority === 3 ? 'third' : '',
      data.priority === 4 ? 'fourth' : '',
      mainStore.selectedId === data.id ? 'selected' : '',
      !data.isDone && dayjs(data.endTime).startOf('day').isBefore(dayjs(new Date()).startOf('day')) ? 'delay' : ''
        ]">{{ data.title }}
    </div>
    <Forward :data="data" v-if="data.endTime === fullDate" :full-date="fullDate"/>
  </div>
</template>

<script setup>
import Backend from "@/components/Backend";
import Forward from "@/components/Forward";
import {onMounted, ref} from "vue";
import {useMainStore} from "@/store";
import {myDayjs as dayjs} from "@/utils/dayUtils";

const mainStore = useMainStore()
const item = ref(null)
const {data, fullDate, show} = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullDate: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  },
})

function showPanel(e) {
  e.stopPropagation()
  e.preventDefault()
  mainStore.showPanel = true
  mainStore.selectedId = data.id

  Object.assign(mainStore.panel, data)
  mainStore.panel.dayDiff = dayjs(data.endTime).startOf('day').diff(dayjs(new Date()).startOf('day'), 'day')
  mainStore.calcPosition(e)
}

onMounted(() => {
  if (show) {
    const parent = item.value.parentElement
    if ([...parent.children].indexOf(item.value) <= data.count + 1) {
      let count = data.count - [...parent.children].indexOf(item.value)
      for (let i = 0; i < count; i++) {
        let dom = document.createElement('div')
        dom.className = 'calendar-item-item'
        parent.insertBefore(dom, item.value)
      }
    }
    if (data.count > 0 && data.count !== [...parent.children].indexOf(item.value)) {
      if (parent.childElementCount < data.count + 1) {
        for (let i = 0; i < data.count - parent.childElementCount; i++) {
          let dom = document.createElement('div')
          dom.className = 'calendar-item-item'
          parent.insertBefore(dom, item.value)
        }
      } else {
      }
    }
  }
})
</script>

<style scoped>
.calendar-item-item {
  margin-bottom: 4px;
  display: flex;
  height: 20px;
}

.calendar-item-item .content {
  flex: 1;
  background-color: #92ebb3;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 4px;
  cursor: pointer;
}

.left-border {
  border-top-left-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.right-border {
  border-top-right-radius: .25rem;
  border-bottom-right-radius: .25rem;
}

.selected {
  background-color: #3fe77c !important;
}

.done {
  background-color: #4edfff !important;
}

.first {
  color: #d03050;
}

.second {
  color: #18a058;
}

.third {
  color: #f0a020;
}

.fourth {
  color: #2080f0;
}

.delay {
  background-color: #ffa7a7 !important;
}
</style>