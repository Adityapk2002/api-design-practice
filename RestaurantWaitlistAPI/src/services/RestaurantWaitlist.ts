import type { Group, SeatedGroup, TableState, Table } from "../types/type.ts";

export class RestaurantWaitList {
    private waitList : Group[] = [];
    private tables : Map<string , TableState> = new Map();
    private seatedGroups : Map<string,SeatedGroup> = new Map();
    private readonly maxGroupSize : number;

    constructor(maxGroupSize : number = 20){
        this.maxGroupSize = maxGroupSize;
    }

    joinWaitList(group : Group) : {success : boolean ; message : string} {
        if(group.size <= 0 || group.size > this.maxGroupSize){
            return {
                success : false,
                message : `Group size should be in between 1 to ${this.maxGroupSize}`
            }
        }
        if(this.waitList.some(g => g.id == group.id || this.seatedGroups.has(group.id))){
            return {
                success : false,
                message : "Group already exist in waitlist"
            }
        }
        this.waitList.push(group);
        return {
            success : true,
            message : "Group added to waitlist"
        }
    }
    
    //array.splice(startIndex, howManyToRemove)

    leaveWaitList(groupId : string) : {success : boolean ; message : string}{
        const index = this.waitList.findIndex(g => g.id === groupId);
        if(index === -1){
            return {
                success : false,
                message : "Group not found in waitlist"
            }
        }
        this.waitList.splice(index,1);
        return {
            success : true,
            message : "Group removes from waitlist"
        }
    }


    tableAvailable(table : Table , time : number) : {
        success : boolean;
        seatedGroup? : SeatedGroup;
        message : string;
    } {
        const groupIndex = this.waitList.findIndex(g => g.size === table.capacity)
        if (groupIndex === -1) {
        this.tables.set(table.id, { ...table });
        return { 
        success: false, 
        message: 'No suitable group found, table marked as available' 
      };
    }
    const group = this.waitList[groupIndex]!;
    this.waitList.splice(groupIndex,1);

    const seatedGroup : SeatedGroup = {
        ...group,
        seatedAt : time,
        tableId : table.id
    }
       this.seatedGroups.set(group.id, seatedGroup);
       this.tables.set(table.id, {
      ...table,
      occupiedBy: group.id,
      occupiedAt: time
    });

      return { 
      success: true, 
      seatedGroup, 
      message: 'Group seated successfully' 
    }
    }

    processBatch(
       groups: Group[],
       tables: Table[]
   ): {
       seatingTimes: Record<string, number>;
       currentDinerIds: string[];
       waitingGroups: Group[];
} {
  this.waitList = [];
  this.seatedGroups.clear();
  this.tables.clear();

  const availableTables = tables.map(t => ({
    ...t,
    occupied: false
  }));

  const seatingTimes: Record<string, number> = {};

  const sortedGroups = [...groups].sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );

  for (const group of sortedGroups) {
    this.joinWaitList(group);
  }

  for (const group of [...this.waitList]) {
    const tableIndex = availableTables.findIndex(
      t => !t.occupied && t.capacity >= group.size
    );

    if (tableIndex === -1) continue;

    const table = availableTables[tableIndex]!;
    table.occupied = true;

    const seatedGroup: SeatedGroup = {
      ...group,
      seatedAt: group.arrivalTime,
      tableId: table.id
    };

    this.seatedGroups.set(group.id, seatedGroup);
    this.tables.set(table.id, {
      id: table.id,
      capacity: table.capacity,
      occupiedBy: group.id,
      occupiedAt: group.arrivalTime
    });

    seatingTimes[group.id] = group.arrivalTime;
    this.leaveWaitList(group.id);
  }

  return {
    seatingTimes,
    currentDinerIds: this.getCurrentDinerIds(),
    waitingGroups: this.getWaitlist()
  };
}
 getWaitlist(): Group[] {
    return [...this.waitList];
  }

  getSeatedGroups(): SeatedGroup[] {
    return Array.from(this.seatedGroups.values());
  }

  getCurrentDinerIds(): string[] {
    return Array.from(this.seatedGroups.keys());
  }

  getTables(): TableState[] {
    return Array.from(this.tables.values());
  }

  getAvailableTables(): Table[] {
    return Array.from(this.tables.values())
      .filter(t => !t.occupiedBy)
      .map(t => ({ id: t.id, capacity: t.capacity }));
  }

  getStats() {
    return {
      waitlistSize: this.waitList.length,
      seatedGroups: this.seatedGroups.size,
      totalTables: this.tables.size,
      availableTables: Array.from(this.tables.values()).filter(t => !t.occupiedBy).length,
      occupiedTables: Array.from(this.tables.values()).filter(t => t.occupiedBy).length
    };
  }
}