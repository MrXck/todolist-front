<template>
  <div style="max-width: 60vw;margin: 30px auto 0;">
    <h2 class="note-title">{{ note.title }}</h2>
    <div class="preview">
      <div id="editor" class="content js-toc-content">
        <textarea ref="editor"></textarea>
      </div>
    </div>
  </div>
  <n-card :bordered="false" class="title">
    <div>
      <ol class="js-toc"></ol>
    </div>
  </n-card>
</template>

<script setup>
import {NCard, useMessage, NSpace} from 'naive-ui'
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import request from "@/utils/request";
import {GetNoteByIdURL} from "@/utils/Constant";

const message = useMessage()
const route = useRoute()
const editor = ref(null)
const note = ref({
  title: '',
  detail: ''
})

onMounted(() => {

  if (route.params.id !== null && route.params.id !== undefined) {
    request.get(GetNoteByIdURL + route.params.id).then(res => {
      if (res.code === 0) {
        note.value = res.data.note
        editor.value.value = res.data.note.detail
      } else {
        message.error(res.msg)
      }
      editormd.markdownToHTML('editor', {
        htmlDecode: 'style,script,iframe'
      })
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block)
      })
      setTimeout(() => {
        tocbot.init({
          // Where to render the table of contents.
          tocSelector: '.js-toc',
          // Where to grab the headings to build the table of contents.
          contentSelector: '.js-toc-content',
          // Which headings to grab inside of the contentSelector element.
          headingSelector: 'h1, h2, h3, h4, h5, h6',
          // For headings inside relative or absolute positioned containers within content.
          hasInnerContainers: true,
        });
      }, 200)
    })
  } else {
    message.error('页面有误')
  }
})
</script>

<style>
.note-title {
  font-size: 30px;
  text-align: center;
}

.title {
  display: block !important;
  width: 15%;
  margin-left: 20px;
  max-height: 80vh;
  overflow: auto;
  position: fixed;
  top: 20px;
  right: 30px;
}

.preview {
  display: flex;
}

.content {
}

.preview pre ol span {
  white-space: pre;
}

.preview pre {
  position: relative;
  background: #21252b !important;
  border-radius: 5px;
  font: 15px/22px "Microsoft YaHei", "Arial", Sans-Serif;
  line-height: 1.6;
  margin-bottom: 1.6em;
  max-width: 100%;
  overflow: auto;
  text-shadow: none;
  color: #000;
  padding-top: 30px;
  box-shadow: 0 10px 10px 0 rgb(0 0 0 / 40%);
}

.preview .editormd-html-preview pre.prettyprint {
  border: 0;
}

.preview li.L1, .preview li.L3, .preview li.L5, .preview li.L7, .preview li.L9 {
  background: none;
}

.preview pre {
  position: relative;
  padding: 30px 10px 10px 10px !important;
}

.preview pre::after {
  display: block;
  content: " ";
  position: absolute;
  border-radius: 50%;
  background: #ff5f56;
  width: 12px;
  height: 12px;
  top: 0;
  left: 12px;
  margin-top: 12px;
  -webkit-box-shadow: 20px 0 #ffbd2e, 40px 0 #27c93f;
  box-shadow: 20px 0 #ffbd2e, 40px 0 #27c93f;
}

.preview .markdown-body pre li {
  border-left: 1px solid #6c7978;
  padding-left: 10px
}
</style>