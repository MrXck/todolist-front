<script setup>
import 'jsmind/style/jsmind.css'
import jsMind from 'jsmind'
import 'jsmind/draggable-node'
import {onMounted, ref} from "vue";
import request from "@/utils/request";
import {AddMindURL, GetMindByIdURL, UpdateMindURL} from "@/utils/Constant";
import {useRoute} from "vue-router";
import {NScrollbar, NCard, NButton, NInput, NSpace, useMessage} from 'naive-ui'

const uuid = require('uuid')
const type = ref('add')
const container = ref(null)
const message = useMessage()
let jm = null
const route = useRoute()
const mindInfo = ref({
  id: '',
  name: '',
  content: ''
})
let mind = {
  /* 元数据，定义思维导图的名称、作者、版本等信息 */
  meta: {
    name: '思维导图',
    author: '',
    version: '0.2'
  },
  /* 数据格式声明 */
  format: 'node_tree',
  /* 数据内容 */
  data: {
    id: 'root',
    topic: 'root',
    children: [
    ]
  }
}

const options = {
  container: container.value,
  editable: true,
  theme: 'primary',
  shortcut: {
    enable: true, // 开启快捷键
  }
}

function save() {
  if (mindInfo.value.name === '') {
    message.error('请输入思维导图名称')
    return
  }

  mindInfo.value.content = JSON.stringify(jm.get_data('node_tree'))
  if (type.value === 'add') {
    request.post(AddMindURL, mindInfo.value).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.error(res.msg)
      }
    })
  } else {
    request.post(UpdateMindURL, mindInfo.value).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.error(res.msg)
      }
    })
  }
}

onMounted(() => {
  options.container = container.value
  jm = new jsMind(options)

  if (route.params.id !== null && route.params.id !== undefined) {
    type.value = 'edit'
    mindInfo.value.id = route.params.id
    request.get(GetMindByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        mindInfo.value = res.data.mind
        mind = JSON.parse(mindInfo.value.content)
        jm.show(mind)
      } else {
        message.error(res.msg)
      }
    })
  } else {
    jm.show(mind)
  }

  document.addEventListener('keydown', function (event) {
    // 按下 Ctrl + Enter 键
    if (event.keyCode === 9) {
      // 阻止默认行为
      event.preventDefault()
      // 获取当前选中的节点
      const selected_node = jm.get_selected_node()
      // 如果没有选中节点，则直接返回
      if (!selected_node) {
        return
      }
      // 添加一个子节点，并让它处于编辑状态
      const new_node = jm.add_node(selected_node, uuid.v4(), 'edit')
      jm.select_node(new_node)
      jm.begin_edit(new_node)
    }
  })

})
</script>

<template>
  <n-card style="position: fixed;top: 70px;right: 20px;width: 300px;z-index: 999">
    <n-space>
      <n-space>
        <n-input placeholder="请输入思维导图的名称" v-model:value="mindInfo.name"/>
      </n-space>
      <n-space>
        <n-button @click="save">保存</n-button>
      </n-space>
    </n-space>
  </n-card>
  <n-scrollbar style="height: calc(100vh - 90px);width: 100%">
    <div id="jsmind_container" ref="container"></div>
  </n-scrollbar>
</template>

<style scoped>
#jsmind_container {
  height: calc(100vh - 90px);
  //width: 100%;
}
</style>