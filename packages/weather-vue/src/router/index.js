import { createRouter, createWebHistory } from "vue-router";
import City from "@/views/City.vue";

const routes = [
  {
    path: "/city/:cityName",
    name: "City",
    props: true,
    component: City,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
