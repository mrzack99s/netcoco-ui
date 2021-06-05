import Device from "./device";
import InterfaceMode from "./interface-mode";
import Vlan from "./vlan";

interface PoInterface {
    id: number
    po_interface_id: number,
    po_interface_shutdown?: boolean
    edges?:{
        mode?: InterfaceMode
        on_device?: Device
        have_vlans?: Vlan[]
        native_on_vlan?: Vlan
    }
}

export default PoInterface;