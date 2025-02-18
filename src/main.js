import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createDiscreteApi} from 'naive-ui'
import {createPinia} from 'pinia'

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/todo/sw.js").then(registration => {
    console.log(`Service Worker registered with scope: ${registration.scope}`);
  }).catch(error => {
    console.log(`Service Worker registration failed: ${error}`);
  });
}

const {message, dialog, notification, loadingBar} = createDiscreteApi([
  'message',
  'dialog',
  'notification',
  'loadingBar'
]);
export {message, dialog, notification, loadingBar};

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
