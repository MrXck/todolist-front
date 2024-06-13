<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";

const {tagList} = defineProps({
  tagList: {
    type: Array,
    required: true
  }
})
const directoryBody = ref(null)
const itemIndex = ref(0)
let height = 0

function scroll(e) {
  const scrollTop = document.documentElement.scrollTop
  for (let i = 0; i < tagList.length; i++) {
    if (scrollTop > tagList[i].offsetTop) {
      itemIndex.value = i
      if (tagList[i].top > height / 2) {
        scrollDirector(tagList[i].top - height / 2 + 29)
      } else {
        scrollDirector(0)
      }
    }
  }
}

function scrollDirector(offsetTop) {
  directoryBody.value.scroll({
    top: offsetTop,
  })
}

function scrollTitle(item) {
  // location.hash = item.id
  document.documentElement.scroll({
    top: item.offsetTop
  })
}

onMounted(() => {
  height = directoryBody.value.getBoundingClientRect().height
  window.addEventListener('scroll', scroll)

})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scroll)
})
</script>

<template>
  <div class="directory">
    <div class="directory-title">目录</div>
    <div class="directory-body" ref="directoryBody">
      <div @click="scrollTitle(item)" :class="[
                  'directory-item',
                  itemIndex === index ? 'active' : ''
              ]" v-for="(item, index) in tagList"
           :style="`--indentation: ${item.indentation}`">{{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.directory {
  position: sticky;
  top: 80px;
  background-color: #fff;
  color: black;
  margin-bottom: 20px;
  box-shadow: 0 3px 8px 6px rgba(7,17,27,0.05);
  border-radius: 8px;
  transition: .3s all;
}

.directory:hover {
  box-shadow: 0 3px 8px 6px rgba(7,17,27,0.09);
}

.active {
  color: #1e80ff !important;
}

.directory-title {
  margin: 0 20px;
  border-bottom: 1px solid #e4e6eb;
  height: 57px;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.directory-body {
  height: calc(300px);
  overflow: auto;
  padding: 10px 0;
}

.directory-item {
  padding: 4px 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
  display: block;
  padding-left: calc(20px + var(--indentation) * 20px);
}

.directory-item:hover {
  color: #1e80ff;
}
</style>
