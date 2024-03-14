<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-message-provider>
        <DndProvider :backend="HTML5Backend">
          <router-view/>
        </DndProvider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>


<script setup>
import {NLoadingBarProvider, NMessageProvider, NConfigProvider, zhCN, dateZhCN} from 'naive-ui'
import { DndProvider } from 'vue3-dnd'
import { HTML5Backend } from "react-dnd-html5-backend"
import {onBeforeUnmount, onMounted} from "vue";
import {useMainStore} from "@/store";


const mainStore = useMainStore()

function keyDown(e) {
  if (e.keyCode === 17) {
    mainStore.keyDown = true
  } else if (e.keyCode === 18) {
    mainStore.altDown = true
  }
}

function keyUp(e) {
  if (e.keyCode === 17) {
    mainStore.keyDown = false
  } else if (e.keyCode === 18) {
    mainStore.altDown = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyDown)
  window.removeEventListener('keyup', keyUp)
})
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
