import dayjs from "dayjs"
import {DateFormat} from "@/utils/Constant";
import updateLocale from "dayjs/plugin/updateLocale";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat"
import solarlunar from 'solarlunar';

const isMonday = true;
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  // weekStart: isMonday ? 1 : 0,
});
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

export const myDayjs = dayjs;

export function getBeforeMonthDays(year, month) {

  // 当前月，默认是 2022年7月
  const currentMonth = dayjs(`${year}-${month}`)

  // 基于本月获取上个月
  const lastMonth = dayjs(currentMonth).subtract(1, "M")

  // 获取本月第一天是周几，firstDayWeek = 5, 周五
  const firstDayWeek = dayjs(currentMonth).startOf("month").day()

  // 上一个月的所有天数, 6月份为 30 天
  const lastMonthDays = lastMonth.daysInMonth()

  // 当月的渲染的结果
  const renderDayList = [];

  // 因为不渲染周五自身，所以将 firstDayWeek - 1
  for (let index = lastMonthDays; index > lastMonthDays - (firstDayWeek); index--) {
    const year = lastMonth.get('y');
    // 0为1月，所以加 1
    const month = lastMonth.get("M") + 1
    renderDayList.push(dayjs(`${year}-${month}-${index}`).format(DateFormat)) // 30,29,28,27
  }

  // 上月的信息需要做一下反转，变为 27,28,29,30
  renderDayList.reverse();

  return renderDayList
}

export function getThisMonthDays(year, month) {

  const currentMonth = dayjs(`${year}-${month}`)
  const renderDayList = getBeforeMonthDays(year, month)

  // 7月份的所有天数
  const currentMonthDays = currentMonth.daysInMonth()

  for (let index = 1; index <= currentMonthDays; index++) {
    const year = currentMonth.get('y')
    // 0为1月，所以加 1
    const month = currentMonth.get("M") + 1
    renderDayList.push(dayjs(`${year}-${month}-${index}`).format(DateFormat))
  }
  return renderDayList
}

export function getNextMonthDays(year, month) {

  const MAX_RENDER_COUNT = 42;

  const currentMonth = dayjs(`${year}-${month}`)
  const renderDayList = getThisMonthDays(year, month)

  // 基于本月获取下个月
  const nextMonth = dayjs(currentMonth).add(1, "M")
  // 下个月的所有天数
  const nextMonthDays = nextMonth.daysInMonth()

  // 上月和本月天数
  const currentLength = renderDayList.length;

  for (let index = 1; index <= MAX_RENDER_COUNT - currentLength; index++) {
    const year = nextMonth.get('y')
    // 0为1月，所以加 1
    const month = nextMonth.get("M") + 1
    renderDayList.push(dayjs(`${year}-${month}-${index}`).format(DateFormat))
  }

  const list = []

  for (let i = 0; i < renderDayList.length; i++) {
    list.push({
      date: renderDayList[i],
      nong: solarlunar.solar2lunar(...renderDayList[i].split('-'))
    })
  }

  return list
}

export function getDaysByNum(date, num) {
  const val = date
  const nowDay = dayjs(val).day()
  const list = []
  // 这周的第一天
  let str
  if (nowDay) {
    // 非周天，即当周
    str = dayjs(val).startOf('week').add(1, 'day')
  } else {
    // 周天，先减去一天，当作是上周的，然后算出来是上周的周天是第一天，最后再加上一天就是周一
    str = dayjs(val).subtract(1, 'day').startOf('week').add(1, 'day')
  }
  for (let i = 0; i < num; i++) {
    list.push(dayjs(str).add(i, 'day').format(DateFormat))
  }
  return list
}

