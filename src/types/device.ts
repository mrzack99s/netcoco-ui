import DeviceType from "./device-type"
import Interface from "./interface";

interface Device {
    id?: number
    device_name?: string
    device_hostname?: string
    device_username?: string
    device_password?: string
    device_enable_password?: string
    device_ssh_port?: number
    edges?: {
        in_type?: DeviceType
        interfaces?: Interface[]
    }
}

export default Device;