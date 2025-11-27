import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import LoginView from "../views/LoginView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import BookManagement from "../views/admin/BookManagement.vue";
import BookFormView from "../views/admin/BookFormView.vue";
import UserManagement from "../views/admin/UserManagement.vue";

const routes = [
    {
        path: "/login",
        name: "login",
        component: LoginView,
    },
    {
        path: "/admin",
        component: AdminDashboardView,
        meta: { requiresAuth: true },
        children: [
            { path: "", redirect: "/admin/books" },
            { path: "books", name: "admin-books", component: BookManagement },
            { path: "books/new", name: "admin-books-new", component: BookFormView },
            { path: "books/edit/:id", name: "admin-books-edit", component: BookFormView },
            { path: "users", name: "admin-users", component: UserManagement },
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/admin",
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isLoggedIn = !!authStore.token;

    if (to.meta.requiresAuth && !isLoggedIn) {
        return next({ name: "login" });
    }
    if (isLoggedIn && to.name === 'login') {
        return next({ path: "/admin" });
    }
    next();
});

export default router;