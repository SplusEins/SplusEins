import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /* shown in the browser tab */
    title?: string;
  }
}
