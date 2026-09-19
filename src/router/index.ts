import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Experience',
    component: () => import('../views/ExperiencePage.vue'),
    meta: {
      title: 'Francis Paul Amadeo — Full Stack Software Engineer',
      description:
        'Portfolio of Francis Paul Amadeo, a full stack software engineer focused on learning management systems, internal tools, and process optimization.',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutPage.vue'),
    meta: {
      title: 'About — Francis Paul Amadeo',
      description:
        'About Francis Paul Amadeo — a full stack software engineer, serial learner, and curator of thoughts on movies, music, books, and software.',
    },
  },
  {
    path: '/other',
    name: 'Other',
    component: () => import('../views/OtherPage.vue'),
    meta: {
      title: 'Writing — Francis Paul Amadeo',
      description:
        'Curated thoughts and writing by Francis Paul Amadeo on movies, music, books, and everything in between.',
    },
  },
  {
    path: '/other/:slug',
    name: 'OtherEntry',
    component: () => import('../views/OtherPage.vue'),
    meta: {
      title: 'Writing — Francis Paul Amadeo',
      description:
        'A writing entry by Francis Paul Amadeo on movies, music, books, and everything in between.',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactPage.vue'),
    meta: {
      title: 'Contact — Francis Paul Amadeo',
      description:
        'Contact Francis Paul Amadeo about full stack engineering, freelance opportunities, or tutoring.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
    meta: {
      title: 'Page Not Found — Francis Paul Amadeo',
      description:
        'The page you are looking for does not exist.',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router