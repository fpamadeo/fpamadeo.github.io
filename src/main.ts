import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { getPendingPath } from './utils/hash-redirect'
import './assets/styles/global.css'

const pendingPath = getPendingPath({
  hash: window.location.hash,
  storage: window.sessionStorage,
})

const app = createApp(App)
app.use(router)

if (pendingPath) {
  router.replace(pendingPath)
}

app.mount('#app')