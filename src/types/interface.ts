import Device from "./device";
import InterfaceMode from "./interface-mode";

interface Interface {
    id: number
    interface_name: string,
    interface_vlan?: string,
    interface_native_vlan?: string
    edges?:{
        mode?: InterfaceMode
        on_device?: Device
    }
}

export default Interface;