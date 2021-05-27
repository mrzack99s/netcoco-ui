import Device from "./device";

interface Topology{
    id?: number
    topology_name: string
    topology_description?: string
    default?: boolean
    edges?: {
        topology?: MapDeviceTopology[]
    }
}

interface MapDeviceTopology{
    id?: number
    position_x: number
    position_y: number
    edges?:{
        device: Device
        edge?: MapDeviceTopology[]
    }
}

export default Topology;