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
  request.post(AddNoteURL, note.value).then(res => {
    if (res.code === 0) {
      message.success('操作成功')
    } else {
      message.error(res.msg)
    }
  })

}

onMounted(() => {
  editor = editormd('editor', {
    placeholder: '请输入内容',
    height: 700,
    path: "/todo/editor-md/lib/",
    imageUpload: true,
    imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
    imageUploadURL: BASEURL + "/file/upload",
  })
})

</script>

<style scoped>

</style>