<template>
  <div style="max-width: 60vw;margin: 30px auto 0;">
    <h2 class="note-title">{{ note.title }}</h2>
    <Viewer ref="viewer" :locale="zhHans" :value="note.detail" :plugins="plugins"/>
  </div>
  <div v-show="showDirectory">
    <Directory class="title" :tag-list="tagList"></Directory>
  </div>
</template>

<script setup>
import {useMessage} from 'naive-ui'
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import request from "@/utils/request";
import {GetNoteByIdURL} from "@/utils/Constant";
import {Viewer} from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import gemoji from '@bytemd/plugin-gemoji'
import highlight from '@bytemd/plugin-highlight'
import frontmatter from '@bytemd/plugin-frontmatter'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import breaks from '@bytemd/plugin-breaks'
import zhHans from 'bytemd/locales/zh_Hans.json'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/tokyo-night-dark.min.css'
import {getProcessor} from "bytemd"
import Directory from "@/views/note-page/Directory.vue";

const message = useMessage()
const route = useRoute()
const note = ref({
  title: '',
  detail: ''
})
const plugins = [
  gfm(),
  gemoji(),
  highlight(),
  frontmatter(),
  mediumZoom(),
  breaks(),
]
const viewer = ref(null)
const tagList = reactive([])
const h = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
const showDirectory = ref(document.documentElement.clientWidth > 768)


const getCataLogData = () => {
  getProcessor({
    plugins: [
      {
        rehype: p =>
            p.use(() => tree => {
              tagList.length = 0
              if (tree && tree.children.length) {
                tree.children.filter(v => {
                  v.indentation = h.indexOf(v.tagName?.toUpperCase())
                  return v.type === 'element' && v.indentation !== -1 && v.children.length > 0
                }).forEach((node, index) => {
                  const offsetTop = document.getElementById(`id-${index}`).offsetTop
                  tagList.push({
                    id: `#id-${index}`,
                    text: node.children[0].value,
                    indentation: node.indentation,
                    offsetTop,
                    top: 29 * index
                  })
                })
              }
            }),
      },
    ],
  }).processSync(note.value.detail)
}


function setTitleId() {
  if (!viewer.value) return

  const children = viewer.value.markdownBody.children
  let index = 0
  tagList.length = 0
  for (let i = 0; i < children.length; i++) {
    if (h.indexOf(children[i].tagName) !== -1) {
      children[i].id = `id-${index}`
      index += 1
    }
  }
  getCataLogData()
}

function resize() {
  showDirectory.value = document.documentElement.clientWidth > 768
}

onMounted(() => {
  if (route.params.id !== null && route.params.id !== undefined) {
    request.get(GetNoteByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        note.value = res.data.note
        document.querySelector('title').innerText = `${note.value.title} - 待办事项`
        setTimeout(() => {
          setTitleId()
          nextTick(() => {
            document.documentElement.scrollTo({
              top: document.querySelector(route.hash).offsetTop,
              behavior: 'smooth'
            })
          })
        }, 1000)
      } else {
        message.error(res.msg)
      }

    })
  } else {
    message.error('页面有误')
  }

  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})
</script>

<style>
body {
  scroll-behavior: smooth;
}

.note-title {
  font-size: 30px;
  text-align: center;
}

.title {
  display: block !important;
  margin-left: 20px;
  overflow: auto;
  position: fixed !important;
  top: 20px;
  right: 30px;
  min-width: 300px;
  width: 20vw;
}

:deep(.markdown-body) {
  color: black;
}

:deep(.markdown-body h1) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ececec;
}

:deep(.markdown-body h2) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ececec;
}

:deep(.markdown-body h3) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
}

:deep(.markdown-body h4) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
}

:deep(.markdown-body h5) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
}

:deep(.markdown-body h6) {
  padding-bottom: 12px;
  margin-top: 35px;
  margin-bottom: 10px;
}

:deep(.medium-zoom-image) {
  max-width: 100%;
}

:deep(.medium-zoom-image--opened) {
  position: fixed !important;
  z-index: 9999 !important;
}
</style>
