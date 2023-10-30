<template>
  <n-space vertical>
      <n-input placeholder="请输入标题" v-model:value="note.title" />
      <div id="editor" v-if="!isLoading">
        <textarea/>
      </div>
    <n-button @click="save">提交</n-button>
  </n-space>

</template>

<script setup>
import {NSpace, NInput, NButton, useMessage} from 'naive-ui'
import {nextTick, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {AddNoteURL, BASEURL, EDITORMD_CONFIG, GetNoteByIdURL, UpdateNoteURL} from "@/utils/Constant";
import request from "@/utils/request";

const route = useRoute();
const message = useMessage();
let editor = null
const type = ref('add')
const isLoading = ref(true)
const note = ref({
  id: '',
  title: '',
  detail: ''
})


function save() {
  note.value.detail = editor.getMarkdown()
  if (type.value === 'add') {
    request.post(AddNoteURL, note.value).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.error(res.msg)
      }
    })
  } else {
    request.post(UpdateNoteURL, note.value).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.error(res.msg)
      }
    })
  }

}

onMounted(() => {
  if (route.params.id !== null && route.params.id !== undefined) {
    type.value = 'edit'
    note.value.id = route.params.id
    request.get(GetNoteByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        note.value = res.data.note
      } else {
        message.error(res.msg)
      }
      isLoading.value = false
      nextTick(() => {
        const config = EDITORMD_CONFIG
        config.markdown = note.value.detail
        editor = editormd('editor', config)
      })
    })
  } else {
    isLoading.value = false
    nextTick(() => {
      const config = EDITORMD_CONFIG
      config.markdown = note.value.detail
      editor = editormd('editor', config)
    })
  }
})

</script>

<style scoped>

</style>