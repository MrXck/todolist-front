<template>
  <n-space vertical>
    <n-input placeholder="请输入标题" v-model:value="note.title"/>
    <Editor :locale="zhHans" :upload-images="handleUploadFile" :value="note.detail" :plugins="plugins"
            @change="handleChange"/>
    <iframe ref="frame" :src="DRAW_IO_URL" width="1500" height="800"></iframe>
    <n-button @click="save">提交</n-button>
  </n-space>

</template>

<script setup>
import {NSpace, NInput, NButton, useMessage} from 'naive-ui'
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {AddNoteURL, BASEURL, DRAW_IO_URL, GetNoteByIdURL, UpdateNoteURL} from "@/utils/Constant";
import request from "@/utils/request";
import {Editor} from '@bytemd/vue-next'
import gfm from "@bytemd/plugin-gfm";
import gemoji from "@bytemd/plugin-gemoji";
import highlight from "@bytemd/plugin-highlight";
import frontmatter from "@bytemd/plugin-frontmatter";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import breaks from "@bytemd/plugin-breaks";
import zhHans from 'bytemd/locales/zh_Hans.json'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/tokyo-night-dark.min.css'


const plugins = [
  gfm(),
  gemoji(),
  highlight(),
  frontmatter(),
  mediumZoom(),
  breaks(),
]
const route = useRoute();
const message = useMessage();
const frame = ref()
const type = ref('add')
const isLoading = ref(true)
const note = ref({
  id: '',
  title: '',
  detail: '',
  chart: '',
})

function handleChange(val) {
  note.value.detail = val
}

function save() {
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

async function handleUploadFile(files) {
  const formData = new FormData();
  formData.append('editormd-image-file', files[0])
  const res = await uploadImageApi(formData)

  if (res.success !== 0) {
    const split = res.url.split('/')
    return [
      {
        title: split[split.length - 1],
        url: BASEURL + res.url,
      },
    ]
  } else {
    return []
  }

}

function uploadImageApi(formData, config = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}) {
  return request.post("/file/upload", formData, config)
}

function getChart(e) {
  note.value.chart = e.data.data
}

onMounted(() => {
  window.addEventListener("message", getChart)

  if (route.params.id !== null && route.params.id !== undefined) {
    type.value = 'edit'
    note.value.id = route.params.id
    request.get(GetNoteByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        note.value = res.data.note
        const data = {
          title: note.value.title,
          data: note.value.chart
        }
        setTimeout(() => {
          frame.value.contentWindow.postMessage(data, "*")
        }, 3000)
      } else {
        message.error(res.msg)
      }
      isLoading.value = false
    })
  } else {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("message", getChart)
})

</script>

<style scoped>
:deep(.bytemd) {
  z-index: 999;
  height: 80vh;
}
</style>
