import express from 'express'
import type type = require('./types/type');
import type Table = require('./types/type');

const app = express();
app.use(express.json());

const waitingList : type.Group[] = []
const tables = new Map<string , Table>();
const occupiedtables = new Map<string, Group>();
const seatingHistory = new Map<string,number>();

function findFirstSeatingGroup(
    tableCapacity : number
):number{
    for(let i = 0 ; i < waitingList.length ; i++){
        if(waitingList[i]?.size <= tableCapacity){
            return i;
        }
    }
    return -1;
}

app.post('/table',(req,res) => {
    
})