<template>
  <n-space vertical>
      <n-input placeholder="请输入标题" v-model:value="note.title" />
      <div id="editor">
        <textarea/>
      </div>
    <n-button @click="save">提交</n-button>
  </n-space>

</template>

<script setup>
import {NSpace, NInput, NButton, useMessage} from 'naive-ui'
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {AddNoteURL, BASEURL, GetNoteByIdURL, UpdateNoteURL} from "@/utils/Constant";
import request from "@/utils/request";

const route = useRoute();
const message = useMessage();
let editor = null
const note = ref({
  id: '',
  title: '',
  detail: ''
})


function save() {
  note.value.detail = editor.getMarkdown()
    request.post(UpdateNoteURL, note.value).then(res => {
      if (res.code === 0) {
        message.success('操作成功')
      } else {
        message.error(res.msg)
      }
    })
}

onMounted(() => {
  if (route.params.id !== null && route.params.id !== undefined) {
    note.value.id = route.params.id
    request.get(GetNoteByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        note.value = res.data.note
      } else {
        message.error(res.msg)
      }
      editor = editormd('editor', {
        placeholder: '请输入内容',
        height: 700,
        path: "/todo/editor-md/lib/",
        imageUpload: true,
        imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
        imageUploadURL: BASEURL + "/file/upload",
        markdown: note.value.detail
      })
    })
  }
})

</script>

<style scoped>

</style>