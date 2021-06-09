import { VueConstructor } from "vue";


export default {
    /* eslint-disable */
    install(Vue: VueConstructor<Vue>, options: {}) {
        Vue.prototype.$notSupportL3 = ["sg300"]
        Vue.prototype.$notSupportL2 = ["router"]
        Vue.prototype.$canBeConfigList = ["l2switch", "l3switch", "router"]
        Vue.prototype.$ablePortChannelConfig = ["l3switch", "l2switch"]
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $notSupportL3: string[]
        $notSupportL2: string[]
        $canBeConfigList: string[]
        $ablePortChannelConfig: string[]
    }
}