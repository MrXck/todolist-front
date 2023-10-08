import {defineStore} from 'pinia'
import dayjs from "dayjs"
import {DateFormat} from "@/utils/Constant";

// 第一个参数 容器id,必须唯一
export const useMainStore = defineStore('main', {
  state: () => {
    return {
      dataList: [],
      showPanel: false,
      panel: {
        startTime: dayjs(new Date()).format(DateFormat),
        endTime: dayjs(new Date()).format(DateFormat),
        dayDiff: 0,
        title: '',
        detail: '',
        priority: 5,
        isDone: false,
        id: 0
      },
      panelPosition: {
        x: 0,
        y: 0
      },
      selectedId: 0,
    }
  },
  // 会缓存 只会调用一次
  getters: {
    panelDate(state) {
      return [new Date(state.panel.startTime).getTime(), new Date(state.panel.endTime).getTime()]
    },
    panelDateOne(state) {
      return new Date(state.panel.startTime).getTime()
    }
  },
  actions: {
    // 可以接收参数
    updateData(dataList) {

      dataList.map(item => {
        item.count = 0
      })
      dataList.sort((a, b) => {
        const aDuration = new Date(a.endTime) - new Date(a.startTime);
        const bDuration = new Date(b.endTime) - new Date(b.startTime);
        return bDuration - aDuration;
      });

      for (let i = dataList.length - 1; i > 0; i--) {
        let overlapCount = 0;
        for (let j = i - 1; j >= 0; j--) {
          const interval1 = dataList[i]
          const interval2 = dataList[j]
          // if ((dayjs(interval1.startTime).isSame(dayjs(interval2.endTime)) || dayjs(interval1.startTime).isBefore(dayjs(interval2.endTime))) && (dayjs(interval1.endTime).isSame(dayjs(interval2.startTime)) || dayjs(interval1.endTime).isAfter(dayjs(interval2.startTime)))) {
          //   overlapCount++;
          // }
          if (interval1.startTime <= interval2.endTime && interval1.endTime >= interval2.startTime) {
            overlapCount++
          }
        }
        dataList[i].count = overlapCount
      }

      for (let i = 0; i < dataList.length; i++) {
        let overlapCount = 0;
        let overlapInterval = null
        if (i > 0) {
          const interval1 = dataList[i]
          const interval2 = dataList[i - 1];
          if (interval1.startTime <= interval2.endTime && interval1.endTime >= interval2.startTime) {
            overlapCount = 1
            const overlapStart = interval1.startTime > interval2.startTime ? interval1.startTime : interval2.startTime
            const overlapEnd = interval1.endTime < interval2.endTime ? interval1.endTime : interval2.endTime
            overlapInterval = {startTime: dayjs(overlapStart), endTime: dayjs(overlapEnd)}
          }
        }
        dataList[i].date = overlapInterval
      }

      this.$patch(state => {
        state.dataList = dataList
      })
    },
    update() {
      this.updateData(this.dataList)
    },
    updateBak(dataList) {
      dataList.sort((a, b) => {
        const aDuration = new Date(a.endTime) - new Date(a.startTime);
        const bDuration = new Date(b.endTime) - new Date(b.startTime);
        return bDuration - aDuration;
      });

      for (let i = dataList.length - 1; i > 0; i--) {
        let overlapCount = 0;
        for (let j = i - 1; j >= 0; j--) {
          const interval1 = dataList[i];
          const interval2 = dataList[j];
          if (interval1.startTime < interval2.endTime && interval1.endTime > interval2.startTime) {
            overlapCount++;
          }
        }
        dataList[i].count = overlapCount
      }

      for (let i = 0; i < dataList.length; i++) {
        let overlapCount = 0;
        let overlapInterval = null;
        if (i > 0) {
          const interval1 = dataList[i];
          const interval2 = dataList[i - 1];
          if (interval1.startTime < interval2.endTime && interval1.endTime > interval2.startTime) {
            overlapCount = 1;
            const overlapStart = interval1.startTime > interval2.startTime ? interval1.startTime : interval2.startTime;
            const overlapEnd = interval1.endTime < interval2.endTime ? interval1.endTime : interval2.endTime;
            overlapInterval = {startTime: dayjs(overlapStart), endTime: dayjs(overlapEnd)};
          }
        }
        dataList[i].date = overlapInterval
      }
    },
    calcPosition(e) {
      const rect = e.target.getBoundingClientRect()

      const width = rect.width
      const height = rect.height === 224 ? rect : 224

      const menuWidth = document.querySelector('.n-menu-item').getBoundingClientRect().width
      const x = window.innerWidth - menuWidth - (rect.x + width)
      const y = window.innerHeight - 56 - (rect.y + height)

      let posX = 0
      let posY = 0

      if (y > 0) {
        posY = rect.y
      } else {
        posY = rect.y - height - 30 + 56
      }

      if (x > 0) {
        posX = rect.x - width
      } else {
        posX = rect.x - width + x - 80
      }
      this.panelPosition.x = posX < 0 ? 0 : posX
      this.panelPosition.y = posY
    }
  }
})