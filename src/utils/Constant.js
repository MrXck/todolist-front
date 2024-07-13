export const BASEURL = 'http://110.42.211.207:9000'// export const BASEURL = 'http://127.0.0.1:9000'export const DRAW_IO_URL = '/todo/drawio/index.html?dev=1'// export const BASEURL = `http://${BASE_IP}:${BASE_PORT}`export const DateFormat = 'YYYY-MM-DD'export const DateTimeFormat = 'YYYY-MM-DD HH:mm:ss'export const TimeFormat = 'HH:mm:ss'export const LoginURL = '/user/login'export const RegisterURL = '/user/register'export const UpdateUserURL = '/user/update'export const SendEmailURL = '/user/sendEmail/'export const BindUserEmailURL = '/user/bindEmail'export const GetTodoByMonthURL = '/todo/getByMonth'export const UpdateTodoByIdURL = '/todo/updateById'export const AddTodoURL = '/todo/addTodo'export const RemoveTodoByIdURL = '/todo/removeTodoById/'export const GetThisMonthTodoURL = '/todo/getThisMonthTodo/'export const GetAllTodoURL = '/todo/getAllTodo'export const GetTodayTodoURL = '/todo/getTodayTodo'export const GetDelayTodoURL = '/todo/getDelayTodo'export const GetDoneTodoURL = '/todo/getDoneTodo'export const BatchGenerateTodoURL = '/todo/batchGenerateTodo'export const StartTodoURL = '/todo/startTodo/'export const EndTodoURL = '/todo/endTodo/'export const DeleteTodoBatchURL = '/todo/deleteBatch'export const GetNoteByPageURL = '/note/getByPage'export const AddNoteURL = '/note/add'export const UpdateNoteURL = '/note/update'export const GetNoteByIdURL = '/note/'export const RemoveNoteByIdURL = '/note/remove/'export const GetMindByPageURL = '/mind/getByPage'export const AddMindURL = '/mind/add'export const UpdateMindURL = '/mind/update'export const GetMindByIdURL = '/mind/'export const RemoveMindByIdURL = '/mind/remove/'export const GetAllTaskBoxURL = '/taskBox/all'export const AddTaskBoxURL = '/taskBox/add'export const UpdateTaskBoxURL = '/taskBox/update'export const RemoveTaskBoxByIdURL = '/taskBox/remove/'export const GetTodoByTaskBoxIdURL = '/taskBox/getTodo/'export const GetDateAndCountByUserIdURL = '/operationLog/getDateAndCountByUserId'export const GetTimeThingByDateURL = '/timeThing/date'export const AddTimeThingURL = '/timeThing/insert'export const UpdateTimeThingURL = '/timeThing/update'export const RemoveTimeThingByIdURL = '/timeThing/'export const options = [    {        label: '非常重要',        value: 1,        style: {            color: '#ec49a0'        }    },    {        label: '重要',        value: 2,        style: {            color: '#8e70ff'        }    },    {        label: '非常紧急',        value: 3,        style: {            color: '#e6a23c'        }    },    {        label: '紧急',        value: 4,        style: {            color: '#2080f0'        }    },    {        label: '一般',        value: 5    }]export const NoticeTypeOptions = [    {        label: "提醒一次",        value: 1,        child: []    },    {        label: "每天",        value: 2,        child: []    },    {        label: "每周",        value: 3,        child: [            {                label: "周一",                value: 1,            },            {                label: "周二",                value: 2,            },            {                label: "周三",                value: 3,            },            {                label: "周四",                value: 4,            },            {                label: "周五",                value: 5,            },            {                label: "周六",                value: 6,            },            {                label: "周日",                value: 7,            },        ]    },    {        label: "每月",        value: 4,        child: [            {'label': '1号', 'value': 1},            {'label': '2号', 'value': 2},            {'label': '3号', 'value': 3},            {'label': '4号', 'value': 4},            {'label': '5号', 'value': 5},            {'label': '6号', 'value': 6},            {'label': '7号', 'value': 7},            {'label': '8号', 'value': 8},            {'label': '9号', 'value': 9},            {'label': '10号', 'value': 10},            {'label': '11号', 'value': 11},            {'label': '12号', 'value': 12},            {'label': '13号', 'value': 13},            {'label': '14号', 'value': 14},            {'label': '15号', 'value': 15},            {'label': '16号', 'value': 16},            {'label': '17号', 'value': 17},            {'label': '18号', 'value': 18},            {'label': '19号', 'value': 19},            {'label': '20号', 'value': 20},            {'label': '21号', 'value': 21},            {'label': '22号', 'value': 22},            {'label': '23号', 'value': 23},            {'label': '24号', 'value': 24},            {'label': '25号', 'value': 25},            {'label': '26号', 'value': 26},            {'label': '27号', 'value': 27},            {'label': '28号', 'value': 28},            {'label': '29号', 'value': 29},            {'label': '30号', 'value': 30},            {'label': '31号', 'value': 31}        ]    },]export const GenerateTypeDay = 1export const GenerateTypeWeek = 2export const GenerateTypeMonth = 3export const GenerateOptions = [    {        label: "每天",        value: GenerateTypeDay,        child: []    },    {        label: "每周",        value: GenerateTypeWeek,        child: [            {                label: "周一",                value: 1,            },            {                label: "周二",                value: 2,            },            {                label: "周三",                value: 3,            },            {                label: "周四",                value: 4,            },            {                label: "周五",                value: 5,            },            {                label: "周六",                value: 6,            },            {                label: "周日",                value: 7,            },        ]    },    {        label: "每月",        value: GenerateTypeMonth,        child: [            {'label': '1号', 'value': 1},            {'label': '2号', 'value': 2},            {'label': '3号', 'value': 3},            {'label': '4号', 'value': 4},            {'label': '5号', 'value': 5},            {'label': '6号', 'value': 6},            {'label': '7号', 'value': 7},            {'label': '8号', 'value': 8},            {'label': '9号', 'value': 9},            {'label': '10号', 'value': 10},            {'label': '11号', 'value': 11},            {'label': '12号', 'value': 12},            {'label': '13号', 'value': 13},            {'label': '14号', 'value': 14},            {'label': '15号', 'value': 15},            {'label': '16号', 'value': 16},            {'label': '17号', 'value': 17},            {'label': '18号', 'value': 18},            {'label': '19号', 'value': 19},            {'label': '20号', 'value': 20},            {'label': '21号', 'value': 21},            {'label': '22号', 'value': 22},            {'label': '23号', 'value': 23},            {'label': '24号', 'value': 24},            {'label': '25号', 'value': 25},            {'label': '26号', 'value': 26},            {'label': '27号', 'value': 27},            {'label': '28号', 'value': 28},            {'label': '29号', 'value': 29},            {'label': '30号', 'value': 30},            {'label': '31号', 'value': 31}        ]    },]