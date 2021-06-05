import Device from "./device";
import InterfaceMode from "./interface-mode";
import PoInterface from "./po-interface";
import Vlan from "./vlan";

interface Interface {
    id: number
    interface_name: string,
    interface_shutdown?: boolean
    edges?:{
        mode?: InterfaceMode
        on_device?: Device
        have_vlans?: Vlan[]
        native_on_vlan?: Vlan
        on_po_interface?: PoInterface
    }
}

export default Interface;