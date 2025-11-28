import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoginView from '../views/LoginView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import UserManagement from '../views/UserManagement.vue'
import UserFormView from '../views/UserFormView.vue'
import BookManagement from '../views/BookManagement.vue'
import BookFormView from '../views/BookFormView.vue'
import PublisherManagement from '../views/PublisherManagement.vue'
import PublisherFormView from '../views/PublisherFormView.vue'
import BorrowManagement from '../views/BorrowManagement.vue'
import BorrowFormView from '../views/BorrowFormView.vue'
import AdminHome from '../views/AdminHome.vue'
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/admin',
    component: AdminDashboardView, 
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-home',
        component: AdminHome,
    },
      // Quản lý Sách
      { path: 'books', name: 'admin-books', component: BookManagement },
      { path: 'books/new', name: 'admin-books-new', component: BookFormView },
      { path: 'books/edit/:id', name: 'admin-books-edit', component: BookFormView },

      // Quản lý NXB
      { path: 'publishers', name: 'admin-publishers', component: PublisherManagement },
      { path: 'publishers/new', name: 'admin-publishers-new', component: PublisherFormView },
      { path: 'publishers/edit/:id', name: 'admin-publishers-edit', component: PublisherFormView },
      // Quản lý Độc giả
      { path: 'users', name: 'admin-users', component: UserManagement },
      { path: 'users/new', name: 'admin-users-new', component: UserFormView },
      { path: 'users/edit/:id', name: 'admin-users-edit', component: UserFormView },
      // Quản lý Mượn trả sách
      { path: 'borrows', name: 'admin-borrows', component: BorrowManagement },
      { path: 'borrows/new', name: 'admin-borrows-new', component: BorrowFormView },
    ],
  },
  // Route không tồn tại thì về Admin
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard bảo vệ
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    return next({ name: 'login' })
  }
  if (authStore.token && to.name === 'login') {
    return next({ path: '/admin' })
  }
  next()
})

export default router
