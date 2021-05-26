import Device from "./device";
import InterfaceMode from "./interface-mode";
import Vlan from "./vlan";

interface Interface {
    id: number
    interface_name: string,
    interface_vlan?: string,
    interface_native_vlan?: string
    interface_shutdown?: boolean
    edges?:{
        mode?: InterfaceMode
        on_device?: Device
        have_vlans?: Vlan[]
        native_on_vlan?: Vlan
    }
}

export default Interface;