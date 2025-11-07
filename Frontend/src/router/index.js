import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

import LoginView from "../views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import BookManagement from "../views/admin/BookManagement.vue";
import UserManagement from "../views/admin/UserManagement.vue";
import BookFormView from "../views/admin/BookFormView.vue";
const routes = [
    {
        path: "/login",
        name: "login",
        component: LoginView,
    },
    {
        path: "/home",
        name: "home",
        component: HomeView,
        meta: { requiresAuth: true, role: "docgia" }
    },
    {
        path: "/admin",
        name: "admin",
        component: AdminDashboardView,
        meta: { requiresAuth: true, role: "nhanvien" },
        children: [
            {
                path: "", 
                redirect: "/admin/books"
            },
            {
                path: "books", 
                name: "admin-books",
                component: BookManagement
            },
            {
                path: "users",
                name: "admin-users",
                component: UserManagement
            },
            {
                path: "books/new", 
                name: "admin-books-new",
                component: BookFormView 
            },
            {
                path: "books/edit/:id", 
                name: "admin-books-edit",
                component: BookFormView
            },
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/login",
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isLoggedIn = !!authStore.token;
    const isAdmin = authStore.isAdmin();

    if (to.meta.requiresAuth) {
        if (!isLoggedIn) {
            return next({ name: "login" });
        }
        const requiredRole = to.meta.role;
        if (requiredRole === "nhanvien" && !isAdmin) {
            return next({ name: "home" }); 
        }
        if (requiredRole === "docgia" && isAdmin) {
            return next({ name: "admin" }); 
        }
        return next();
        
    } else {
        if (isLoggedIn && to.name === 'login') {
            return next({ name: isAdmin ? 'admin' : 'home' });
        }
        return next();
    }
});

export default router;