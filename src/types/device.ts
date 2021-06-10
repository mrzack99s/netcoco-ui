import DeviceType from "./device-type"
import DevicePlatform from "./device-platform"
import Interface from "./interface";
import Vlan from "./vlan";
import PoInterface from "./po-interface";
import IPStaticRouting from "./ip-static-routing";
import IPAddress from "./ip-address";

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
        po_interfaces?: PoInterface[]
        in_platform?: DevicePlatform
        store_vlans?: Vlan[]
        ip_static_routing?: IPStaticRouting[]
        have_ip_addresses?: IPAddress[]
    }
}

export default Device;