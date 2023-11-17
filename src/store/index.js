import {defineStore} from 'pinia'
import dayjs from "dayjs"
import {DateFormat} from "@/utils/Constant";
import {getRenderEventList} from "@/utils/todoListSortUtils";

// 第一个参数 容器id,必须唯一
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            dataList: [],
            showPanel: false,
            data: [],
            dateList: [],
            taskListOptions: [],
            panel: {
                startTime: dayjs(new Date()).format(DateFormat),
                endTime: dayjs(new Date()).format(DateFormat),
                dayDiff: 0,
                title: '',
                detail: '',
                priority: 5,
                isDone: false,
                taskBoxId: null,
                id: 0
            },
            panelPosition: {
                x: 0,
                y: 0
            },
            selectedId: 0,
            keyDown: false
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
        updateData() {
            const {renderList} = getRenderEventList(JSON.parse(JSON.stringify(this.dateList)), JSON.parse(JSON.stringify(this.data)))
            // dataList.map(item => {
            //   item.count = 0
            // })
            // dataList.sort((a, b) => {
            //   const aDuration = new Date(a.endTime) - new Date(a.startTime);
            //   const bDuration = new Date(b.endTime) - new Date(b.startTime);
            //   return bDuration - aDuration;
            // });
            //
            // for (let i = dataList.length - 1; i > 0; i--) {
            //   let overlapCount = 0;
            //   for (let j = i - 1; j >= 0; j--) {
            //     const interval1 = dataList[i]
            //     const interval2 = dataList[j]
            //     // if ((dayjs(interval1.startTime).isSame(dayjs(interval2.endTime)) || dayjs(interval1.startTime).isBefore(dayjs(interval2.endTime))) && (dayjs(interval1.endTime).isSame(dayjs(interval2.startTime)) || dayjs(interval1.endTime).isAfter(dayjs(interval2.startTime)))) {
            //     //   overlapCount++;
            //     // }
            //     if (interval1.startTime <= interval2.endTime && interval1.endTime >= interval2.startTime) {
            //       overlapCount++
            //     }
            //   }
            //   dataList[i].count = overlapCount
            // }
            //
            // for (let i = 0; i < dataList.length; i++) {
            //   let overlapCount = 0;
            //   let overlapInterval = null
            //   if (i > 0) {
            //     const interval1 = dataList[i]
            //     const interval2 = dataList[i - 1];
            //     if (interval1.startTime <= interval2.endTime && interval1.endTime >= interval2.startTime) {
            //       overlapCount = 1
            //       const overlapStart = interval1.startTime > interval2.startTime ? interval1.startTime : interval2.startTime
            //       const overlapEnd = interval1.endTime < interval2.endTime ? interval1.endTime : interval2.endTime
            //       overlapInterval = {startTime: dayjs(overlapStart), endTime: dayjs(overlapEnd)}
            //     }
            //   }
            //   dataList[i].date = overlapInterval
            // }

            this.$patch(state => {
                state.dataList = renderList
            })
        },
        update() {
            this.updateData()
        },
        updateById(id, item) {
            let data = this.data.find(item => item.id === id)
            let dataIndex = this.data.indexOf(data)
            data = JSON.parse(JSON.stringify(this.data.find(item => item.id === id)))
            Object.assign(data, item)
            delete data['_index']
            this.data[dataIndex] = data
            this.update()
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
            const mouseX = e.clientX
            const mouseY = e.clientY

            let posX = mouseX
            let posY = mouseY

            const clientWidth = 390
            const clientHeight = 284

            const documentWidth = document.documentElement.clientWidth
            const documentHeight = document.documentElement.clientHeight

            if (mouseX > documentWidth - clientWidth) {
                posX = mouseX - clientWidth
            }

            if (mouseY > documentHeight - clientHeight) {
                posY = mouseY - clientHeight
            }

            this.panelPosition.x = posX - 240
            this.panelPosition.y = posY - 80
        },
        calcPositionBak(e) {
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