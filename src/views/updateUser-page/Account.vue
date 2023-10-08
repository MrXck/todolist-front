<template>
<n-card>
  <n-space vertical>
    <n-space align="center">
      <n-space item-style="width: 50px">
        用户名
      </n-space>
      <n-space>
        <n-input v-model:value="user.username" placeholder="请输入用户名" />
      </n-space>
    </n-space>
    <n-space align="center">
      <n-space item-style="width: 50px">
        密码
      </n-space>
      <n-space>
        <n-input v-model:value="user.password" type="password" placeholder="请输入用户名" />
      </n-space>
    </n-space>
    <n-space>
      <n-button @click="update">修改</n-button>
    </n-space>
  </n-space>
</n-card>
</template>

<script setup>
import {NCard, NSpace, NInput, NButton, useMessage} from 'naive-ui'
import {ref} from "vue";
import request from "@/utils/request";
import {UpdateUserURL} from "@/utils/Constant";

const userInfo = JSON.parse(localStorage.getItem('user'))
const message = useMessage()

const user = ref({
  username: userInfo.username,
  password: ''
})

function update() {
  request.post(UpdateUserURL, {
    username: user.value.username,
    password: user.value.password,
  }).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      userInfo.username = user.value.username
      localStorage.setItem('user', JSON.stringify(userInfo))
    } else {
      message.error(res.msg)
    }
  })
}

</script>

<style scoped>

</style>