import { createRouter, createWebHashHistory } from 'vue-router'
import ExperiencePage from '@/views/ExperiencePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import OtherPage from '@/views/OtherPage.vue'

const routes = [
  {
    path: '/',
    name: 'Experience',
    component: ExperiencePage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/other',
    name: 'Other',
    component: OtherPage,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
