import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Experience',
    component: () => import('../views/ExperiencePage.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutPage.vue'),
  },
  {
    path: '/other',
    name: 'Other',
    component: () => import('../views/OtherPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
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
