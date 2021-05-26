import DeviceMapObject from "./device-map-object";

interface PingResponse{
    map: DeviceMapObject
    is_alive: boolean
    avg_rtt: string
}

export default PingResponse;