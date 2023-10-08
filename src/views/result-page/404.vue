<template>
  <div class="not-found">
    <n-result status="404" title="404 资源不存在">
      <template #footer>
        <n-button @click="backHome">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import {NResult, NButton} from 'naive-ui'
import router from "@/router";

function backHome() {
  router.push('/')
}

</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>