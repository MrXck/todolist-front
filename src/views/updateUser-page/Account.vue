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
        <n-input v-model:value="email.email" placeholder="请输入邮箱" />
      </n-space>
      <n-space>
        <n-button @click="sendEmail">发送邮件</n-button>
      </n-space>
      <n-space v-show="email.sendEmail">
        邮箱验证码
      </n-space>
      <n-space v-show="email.sendEmail">
        <n-input v-model:value="email.code" placeholder="请输入验证码" />
      </n-space>
      <n-space v-show="email.sendEmail">
        <n-button @click="bindEmail">绑定邮箱</n-button>
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
import {BindUserEmailURL, SendEmailURL, UpdateUserURL} from "@/utils/Constant";

const userInfo = JSON.parse(localStorage.getItem('user'))
const message = useMessage()
const emailReg = new RegExp(/^(?=.{1,64}@)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*\.[A-Za-z]{2,6}$/)
const user = ref({
  username: userInfo.username,
  password: '',
  enableEmail: (!(userInfo.enableEmail === null || userInfo.enableEmail === undefined)),
})
const email = ref({
  email: userInfo.email,
  code: '',
  sendEmail: false
})

function sendEmail() {
  if (email.value.email !== '') {
    if (!emailReg.test(email.value.email)) {
      message.error('请输入正确的邮箱')
      return
    }
  }
  request.get(SendEmailURL + email.value.email).then(res => {
    if (res.code === 0) {
      message.success('发送成功')
      email.value.sendEmail = true
    } else {
      message.error(res.msg)
    }
  })
}

function bindEmail() {
  if (email.value.email !== '') {
    if (!emailReg.test(email.value.email)) {
      message.error('请输入正确的邮箱')
      return
    }
  }
  request.get(`${BindUserEmailURL}/${email.value.email}/${email.value.code}`).then(res => {
    if (res.code === 0) {
      message.success('绑定成功')
      userInfo.email = email.value.email
      localStorage.setItem('user', JSON.stringify(userInfo))
    } else {
      message.error(res.msg)
    }
  })
}

function update() {
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
      localStorage.setItem('user', JSON.stringify(userInfo))
    } else {
      message.error(res.msg)
    }
  })
}

</script>

<style scoped>

</style>