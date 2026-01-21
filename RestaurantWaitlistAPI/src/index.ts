import express from 'express'
import type { Request, Response } from 'express';
import type { Group, SeatedGroup, TableState, Table } from "./types/type.ts";
import { RestaurantWaitList } from './services/RestaurantWaitlist.js';

const app = express()
app.use(express.json())

const restaurant = new RestaurantWaitList(20);


app.post('/api/waitlist', (req: Request, res: Response) => {
  const { id, size, arrivalTime } = req.body;
  
  if (!id || !size || arrivalTime === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: id, size, arrivalTime' 
    });
  }

  const group: Group = { id, size, arrivalTime };
  const result = restaurant.joinWaitList(group);
  
  return res.status(result.success ? 200 : 400).json(result);
});


app.delete('/api/waitlist/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid group id' });
  }

  const result = restaurant.leaveWaitList(id);
  return res.status(result.success ? 200 : 404).json(result);
});



app.get('/api/waitlist', (req: Request, res: Response) => {
  const waitlist = restaurant.getWaitlist();
  return res.status(200).json({ waitlist });
});

app.post('/api/tables/available', (req: Request, res: Response) => {
  const { id, capacity, time } = req.body;
  
  if (!id || !capacity || time === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: id, capacity, time' 
    });
  }

  const table: Table = { id, capacity };
  const result = restaurant.tableAvailable(table, time);
  
  return res.status(200).json(result);
});

app.get('/api/tables', (req: Request, res: Response) => {
  const tables = restaurant.getTables();
  return res.status(200).json({ tables });
});

app.get('/api/tables/available', (req: Request, res: Response) => {
  const availableTables = restaurant.getAvailableTables();
  return res.status(200).json({ availableTables });
});


app.get('/api/groups/seated', (req: Request, res: Response) => {
  const seatedGroups = restaurant.getSeatedGroups();
  return res.status(200).json({ seatedGroups });
});

app.get('/api/diners/current', (req: Request, res: Response) => {
  const dinerIds = restaurant.getCurrentDinerIds();
  const details = restaurant.getSeatedGroups();
  
  return res.status(200).json({ dinerIds, details });
});

app.post('/api/process-batch', (req: Request, res: Response) => {
  const { groups, tables } = req.body;
  
  if (!groups || !Array.isArray(groups)) {
    return res.status(400).json({ error: 'Invalid groups array' });
  }
  
  if (!tables || !Array.isArray(tables)) {
    return res.status(400).json({ error: 'Invalid tables array' });
  }

  for (const group of groups) {
    if (!group.id || !group.size || group.arrivalTime === undefined) {
      return res.status(400).json({ 
        error: 'Each group must have id, size, and arrivalTime' 
      });
    }
  }

  for (const table of tables) {
    if (!table.id || !table.capacity) {
      return res.status(400).json({ 
        error: 'Each table must have id and capacity' 
      });
    }
  }

  const result = restaurant.processBatch(groups, tables);
  return res.status(200).json(result);
});

app.get('/api/stats', (req: Request, res: Response) => {
  const stats = restaurant.getStats();
  return res.status(200).json(stats);
});

app.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🍽️  Restaurant Waitlist API running on port ${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   POST   /api/waitlist - Add group to waitlist`);
  console.log(`   DELETE /api/waitlist/:id - Remove group from waitlist`);
  console.log(`   GET    /api/waitlist - View current waitlist`);
  console.log(`   POST   /api/tables/available - Mark table available`);
  console.log(`   GET    /api/tables - View all tables`);
  console.log(`   GET    /api/diners/current - Current diner IDs`);
  console.log(`   POST   /api/process-batch - Process batch arrivals`);
});

export { RestaurantWaitList };