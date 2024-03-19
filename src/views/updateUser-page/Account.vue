<template>
<n-card>
  <n-space vertical>
    <n-space align="center">
      <n-space item-style="width: 100px">
        用户名
      </n-space>
      <n-space>
        <n-input v-model:value="user.username" placeholder="请输入用户名" />
      </n-space>
    </n-space>
    <n-space align="center">
      <n-space item-style="width: 100px">
        密码
      </n-space>
      <n-space>
        <n-input v-model:value="user.password" type="password" placeholder="请输入密码" />
      </n-space>
    </n-space>
    <n-space align="center">
      <n-space item-style="width: 100px">
        邮箱
      </n-space>
      <n-space>
        <n-input v-model:value="user.email" placeholder="请输入邮箱" />
      </n-space>
    </n-space>
    <n-space>
      <n-space item-style="width: 100px">
        开启邮件提醒
      </n-space>
      <n-space>
        <n-switch v-model:value="user.enableEmail"></n-switch>
      </n-space>
    </n-space>
    <n-space>
      <n-button @click="update">修改</n-button>
    </n-space>
  </n-space>
</n-card>
</template>

<script setup>
import {NCard, NSpace, NInput, NButton, useMessage, NSwitch} from 'naive-ui'
import {ref} from "vue";
import request from "@/utils/request";
import {UpdateUserURL} from "@/utils/Constant";

const userInfo = JSON.parse(localStorage.getItem('user'))
const message = useMessage()
const emailReg = new RegExp(/^(?=.{1,64}@)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*\.[A-Za-z]{2,6}$/)
const user = ref({
  username: userInfo.username,
  password: '',
  email: userInfo.email,
  enableEmail: (!(userInfo.enableEmail === null || userInfo.enableEmail === undefined)),
})

function update() {
  if (user.value.email !== '') {
    if (!emailReg.test(user.value.email)) {
      message.error('请输入正确的邮箱')
      return
    }
  }
  if (user.value.username === '') {
    message.error('请输入用户名')
    return
  }

  if (user.value.password === '') {
    message.error('请输入密码')
    return
  }
  request.post(UpdateUserURL, user.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
      userInfo.username = user.value.username
      userInfo.email = user.value.email
      localStorage.setItem('user', JSON.stringify(userInfo))
    } else {
      message.error(res.msg)
    }
  })
}

</script>

<style scoped>

</style>