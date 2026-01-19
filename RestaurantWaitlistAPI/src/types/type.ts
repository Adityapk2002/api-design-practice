export type Group = {
    id : string,
    size : number,
    arrivalTime : number
}

export type Table = {
    id : string,
    capacity : number
}

export type SeatedGroup = Group & {
    seatedAt : number,
    tableId : string
}

export type TableState = Table & {
  occupiedBy?: string;
  occupiedAt?: number;
}