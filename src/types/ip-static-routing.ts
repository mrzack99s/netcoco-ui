import Device from "./device";
import Interface from "./interface";

interface IPStaticRouting {
    id?: number
    network_address: string
    subnet_mask: string
    next_hop: string
    brd_interface: boolean
    edges?:{
        on_interface?: Interface
        on_device?: Device
    }
}

export default IPStaticRouting