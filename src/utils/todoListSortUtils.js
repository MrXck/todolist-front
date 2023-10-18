import dayjs from "dayjs";

const getCurrentDayEventList = (date, eventList) => {
    const eventAll = [];
    eventList.forEach((event) => {
        // 默认声明该事件没有后续 也不是最后一个
        const eventInfo = {
            ...event,
            hasLast: false,
            hasNext: false,
        };

        // 取昨天 23:59:59 为一天的开始时间，当天的 23:59:59 为一天的结束时间
        const currentDayStartTime = dayjs(`${date}`)
            .subtract(1, "second")
            .valueOf();
        const currentDayEndTime = dayjs(`${date} 23:59:59`).valueOf();

        const eventStartTime = dayjs(event.startTime).valueOf();
        const eventEndTime = dayjs(event.endTime).valueOf();

        // 判断当天是否有事件
        if (dayjs(date).isBetween(event.startTime, event.endTime, "d", "[]")) {
            // 添加连贯事件标识
            eventInfo.hasLast = eventStartTime < currentDayStartTime;
            eventInfo.hasNext = eventEndTime > currentDayEndTime;
            eventAll.push(eventInfo);
        }
    });

    // 按照渲染规则，排序渲染当天的事件
    return sortEventList(eventAll);
};

const getHasNextEventList = eventList => {
    return eventList.filter((eventItem) => {
        return eventItem.hasNext;
    });
};

export const getRenderEventList = (calendarInfo, eventList) => {
    const currentEventList = [];
    const nextEventList = [];
    const renderList = [];

    // 遍历日历信息
    calendarInfo.forEach((dateInfo) => {
        // 获取当天所有事件
        const currentEvent = getCurrentDayEventList(dateInfo.date, eventList);

        // 获取有下一天的所有事件
        const nextEvent = getHasNextEventList(currentEvent);
        nextEventList.push(nextEvent);
        currentEventList.push(currentEvent);
    });

    calendarInfo.forEach((_dateInfo, index) => {
        // 将当天的时间排序渲染
        const list = handleSortIndexEventList(
            index,
            nextEventList,
            currentEventList[index]
        );
        renderList.push(list);
    });

    return {renderList, currentEventList, nextEventList};
};

const handleSortIndexEventList = (dateIndex, nextEventList, eventAllList) => {
    // 上一天的所有事件
    const lastEvents = dateIndex > 0 ? nextEventList[dateIndex - 1] : [];
    // 最终渲染的事件
    const showEventList = [];

    // 与上一天事件有连贯的事件
    lastEvents.forEach((lastEvent) => {
        eventAllList.forEach((eventItem) => {
            // 同一个事件，并且上一天的事件已通过 _index 确认位置，那么今天的事件也要和上一天的 _index 一致
            if (lastEvent.id === eventItem.id && lastEvent._index !== undefined) {
                showEventList[lastEvent._index] = eventItem;
                eventItem._index = lastEvent._index;
            }
        });
    });

    // 处理当天的事件和与后一天有连续性的
    for (let index = 0; index < eventAllList.length; index++) {
        const eventItem = eventAllList[index];

        // 排除已经处理过的事件
        if (eventItem._index !== undefined) continue;

        let hasIndex = false;

        // 因为处理上一天的事件是通过 索引index 直接赋值的，showEventList 会存在 empty 元素
        for (let showIndex = 0; showIndex < showEventList.length; showIndex++) {
            // 如果有 empty 元素，那么填充当天事件
            if (!showEventList[showIndex]) {
                hasIndex = true;
                eventItem._index = showIndex;
                showEventList[showIndex] = eventItem;
                // 填充完 eventItem 就要 break 掉 showEventList 的循环，继续执行 外层的 eventAllList 循环处理下一个当天的事件
                break;
            }
        }

        // 没有空位 empyt 元素的，依次 push 进去
        if (!hasIndex) {
            eventItem._index = showEventList.length;
            showEventList.push(eventItem);
        }
    }

    // 填充 showEventList 的 empty 位置
    return fixEmptyInfo(dateIndex, showEventList);
};

const sortEventList = eventList => {
    return eventList.sort((a, b) => {
        // a 事件的结束时间是当天
        if (a.hasLast) {
            // b 事件的结束时间不是当天
            if (!b.hasLast) {
                return -1;

                // a 事件的结束时间大于 b 事件的结束时间
            } else if (dayjs(a.endTime).valueOf() > dayjs(b.endTime).valueOf()) {
                return -1;
            }
        }
        // a 事件的结束时间不是当天
        if (a.hasNext) {
            // b 事件的结束时间是当天
            if (!b.hasNext) {
                return -1;

                // a 事件的结束时间大于 b 事件的结束时间
            } else if (dayjs(a.endTime).valueOf() > dayjs(b.endTime).valueOf()) {
                return -1;
            }
        }
        return 1;
    });
};

const fixEmptyInfo = (dateIndex, eventList) => {
    const showEventList = [];
    // 新的一周
    if (dateIndex % 7 === 0) {
        const list = [];
        // 只能通过 for 循环筛选出 empty 元素
        for (let index = 0; index < eventList.length; index++) {
            const eventItem = eventList[index];
            if (eventItem) {
                list.push(eventItem);
            }
        }
        list.forEach((eventItem, index) => {
            eventItem._index = index;
            showEventList.push(eventItem);
        });
    } else {
        // 如果还有 empty 的元素，那么填充 null
        for (let index = 0; index < eventList.length; index++) {
            const eventItem = eventList[index];
            showEventList[index] = eventItem ?? null;
        }
    }
    return showEventList;
};