import { Router } from 'express';
import { db } from '../db/index.js';
import { vehicles } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

export const vehiclesRouter = Router();

// All routes require authentication
vehiclesRouter.use(authenticateToken);

const createVehicleSchema = z.object({
  vin: z.string().length(17),
  year: z.string().length(4),
  make: z.string().min(1),
  model: z.string().min(1),
});

// Create vehicle
vehiclesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createVehicleSchema.parse(req.body);
    const userId = req.userId!;

    const [newVehicle] = await db
      .insert(vehicles)
      .values({
        userId,
        ...data,
      })
      .returning();

    res.status(201).json(newVehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    next(error);
  }
});

// Get all vehicles for user
vehiclesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const userVehicles = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, userId));

    res.json(userVehicles);
  } catch (error) {
    next(error);
  }
});

// Get single vehicle
vehiclesRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const vehicleId = req.params.id;

    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)));

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});
