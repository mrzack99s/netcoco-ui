import { VueConstructor } from "vue";


export default {
    /* eslint-disable */
    install(Vue: VueConstructor<Vue>, options: {}) {
        Vue.prototype.$capitalize = (str: string): string =>{
                return str.charAt(0).toUpperCase() + str.slice(1)
        }
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $capitalize: (str: string) => string
    }
}