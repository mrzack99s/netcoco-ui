import DeviceType from "./device-type"
import DevicePlatform from "./device-platform"
import Interface from "./interface";
import Vlan from "./vlan";

interface Device {
    id?: number
    device_name?: string
    device_hostname?: string
    device_username?: string
    device_password?: string
    device_secret?: string
    device_ssh_port?: number
    device_commit_config?: boolean
    edges?: {
        in_type?: DeviceType
        interfaces?: Interface[]
        in_platform?: DevicePlatform
        store_vlans?: Vlan[]
    }
}

export default Device;