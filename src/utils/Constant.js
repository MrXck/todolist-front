export const BASEURL = 'http://110.42.211.207:9000'// export const BASEURL = `http://${BASE_IP}:${BASE_PORT}`export const DateFormat = 'YYYY-MM-DD'export const LoginURL = '/user/login'export const RegisterURL = '/user/register'export const UpdateUserURL = '/user/update'export const GetTodoByMonthURL = '/todo/getByMonth'export const UpdateTodoByIdURL = '/todo/updateById'export const AddTodoURL = '/todo/addTodo'export const RemoveTodoByIdURL = '/todo/removeTodoById/'export const GetThisMonthTodoURL = '/todo/getThisMonthTodo/'export const GetAllTodoURL = '/todo/getAllTodo'export const GetTodayTodoURL = '/todo/getTodayTodo'export const GetDelayTodoURL = '/todo/getDelayTodo'export const GetDoneTodoURL = '/todo/getDoneTodo'export const GetNoteByPageURL = '/note/getByPage'export const AddNoteURL = '/note/add'export const UpdateNoteURL = '/note/update'export const GetNoteByIdURL = '/note/'export const RemoveNoteByIpURL = '/note/remove/'export const GetMindByPageURL = '/mind/getByPage'export const AddMindURL = '/mind/add'export const UpdateMindURL = '/mind/update'export const GetMindByIdURL = '/mind/'export const RemoveMindByIpURL = '/mind/remove/'export const options = [    {        label: '非常重要',        value: 1,        style: {            color: '#ec49a0'        }    },    {        label: '重要',        value: 2,        style: {            color: '#8e70ff'        }    },    {        label: '非常紧急',        value: 3,        style: {            color: '#e6a23c'        }    },    {        label: '紧急',        value: 4,        style: {            color: '#2080f0'        }    },    {        label: '一般',        value: 5    }]export const EDITORMD_CONFIG = {    placeholder: '请输入内容',    height: 700,    path: "/todo/editor-md/lib/",    imageUpload: true,    imageFormats: ['jpg', 'jpeg', 'png', 'gif'],    imageUploadURL: BASEURL + "/file/upload",}