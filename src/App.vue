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

</script>

<style>
* {
  padding: 0;
  margin: 0;
  font-family: "LXGW WenKai Screen" ,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
  font-weight: normal;
}
</style>
