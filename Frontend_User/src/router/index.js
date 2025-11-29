import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import LoginView from "../views/LoginView.vue";
import MyBooks from "../views/MyBooks.vue";
import BookLibrary from "../views/BookLibrary.vue"; 
import ProfileView from "../views/ProfileView.vue";
import BookDetail from "../views/BookDetail.vue";
const routes = [
    {
        path: "/login",
        name: "login",
        component: LoginView,
    },
    {
        path: "/",
        name: "library",
        component: BookLibrary, 
        meta: { requiresAuth: true }
    },
    {
        path: "/my-books",
        name: "my-books",
        component: MyBooks,
        meta: { requiresAuth: true }
    },
    {
        path: "/profile",
        name: "profile",
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: "/books/:id", // :id là tham số động
        name: "book-detail",
        component: BookDetail,
        meta: { requiresAuth: true }
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/",
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
        return next({ path: "/" });
    }
    next();
});

export default router;