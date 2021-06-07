import Device from "./device";
import InterfaceLayer from "./interface-layer";
import InterfaceMode from "./interface-mode";
import IPAddress from "./ip-address";
import Vlan from "./vlan";

interface PoInterface {
    id: number
    po_interface_id: number,
    po_interface_shutdown?: boolean
    edges?:{
        mode?: InterfaceMode
        on_device?: Device
        have_vlans?: Vlan[]
        on_layer?: InterfaceLayer
        on_ip_address?: IPAddress
        native_on_vlan?: Vlan
    }
}

export default PoInterface;