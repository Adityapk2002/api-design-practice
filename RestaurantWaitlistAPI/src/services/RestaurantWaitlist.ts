import type { Group, SeatedGroup, TableState } from "../types/type.ts";

class RestaurantWaitList {
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
                message : "Group size should be in between 1 to "
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
}