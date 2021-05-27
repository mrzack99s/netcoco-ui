import axios, { AxiosInstance } from "axios";
import { VueConstructor } from "vue";

interface Options {
    baseURL: string
}

export default {
    /* eslint-disable */
    install(Vue: VueConstructor<Vue>, options: Options) {
        Vue.prototype.$api_connection = {
            secureAPI: (): AxiosInstance | null => {
                if (localStorage.logged != null) {
                    const localSession = localStorage.logged;
                    const session = JSON.parse(localSession);
                    const api = axios.create({
                        baseURL: `${options.baseURL}/api`,
                        auth: {
                            username: session.username,
                            password: session.api_secret
                        }
                    })
                    return api
                }
                return null
            },
            unsecureAPI: (): AxiosInstance | null => {
                const api = axios.create({
                    baseURL: `${options.baseURL}/unsecure/api`,
                })
                return api
            }
        }
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $api_connection: {
            secureAPI: () => AxiosInstance
            unsecureAPI: () => AxiosInstance
        };
    }
}