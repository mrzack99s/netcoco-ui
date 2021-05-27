import Device from "./device";

interface DeviceMapObject{
    position_x: number,
    position_y: number,
    topology_id: number,
    edges:{
        device: Device
    }
}

export default DeviceMapObject;
