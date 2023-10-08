import request from "@/utils/request";
import {AddTodoURL, RemoveTodoByIdURL, UpdateTodoByIdURL} from "@/utils/Constant";

export const save = function (data){
    return request.post(AddTodoURL, data)
}

export const update = function (data) {
    return request.post(UpdateTodoByIdURL, data)
}

export const removeTodo = function (id) {
    return request.post(RemoveTodoByIdURL + id)
}

export const toggleDone = function (data) {
    return request.post(UpdateTodoByIdURL, data)
}