import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ServerResponse from "../utils/ServerResponse";

const prisma = new PrismaClient();

// Start a new parking session (vehicle entry)
const startParkingSession = async (req: Request, res: Response) => {
  try {
    const { vehicleId, parkingId, userId } = req.body;

    // Validate required fields
    if (!vehicleId || !parkingId) {
      return ServerResponse.error(
        res,
        "Vehicle ID and Parking ID are required"
      );
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { user: true },
    });
    if (!vehicle) {
      return ServerResponse.error(res, "Vehicle not found");
    }

    // Find available parking lot
    const availableLot = await prisma.parkingLot.findFirst({
      where: {
        parkingId,
        isOccupied: false,
      },
    });

    if (!availableLot) {
      return ServerResponse.error(res, "No available parking spaces");
    }

    // Start transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create parking session
      const newSession = await tx.parkingSession.create({
        data: {
          vehicleId,
          parkingId,
          parkingLotId: availableLot.id,
          userId: userId || vehicle.userId,
          status: "ACTIVE",
        },
      });

      const ticket = await tx.ticket.create({
        data: {
          sessionId: newSession.id,
        },
      });

      // Update parking lot status
      await tx.parkingLot.update({
        where: { id: availableLot.id },
        data: { isOccupied: true },
      });

      // Update available spaces in parking
      await tx.parking.update({
        where: { id: parkingId },
        data: {
          availableSpaces: {
            decrement: 1,
          },
        },
      });

      return { session: newSession, ticket };
    });

    return ServerResponse.success(
      res,
      "Parking session started successfully",
      result
    );
  } catch (error) {
    console.error("Error starting parking session:", error);
    return ServerResponse.error(res, "Error starting parking session", error);
  }
};

// End a parking session (vehicle exit)
const endParkingSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Find the active session
    const session = await prisma.parkingSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        parking: true,
        parkingLot: true,
        vehicle: true,
      },
    });

    if (!session || session.status !== "ACTIVE") {
      return ServerResponse.error(res, "Active parking session not found");
    }

    // Calculate duration and amount
    const exitTime = new Date();
    const entryTime = session.entryTime;
    const durationMinutes = Math.ceil(
      (exitTime.getTime() - entryTime.getTime()) / (1000 * 60)
    );
    const totalAmount = (durationMinutes / 60) * session.parking.feePerHour;

    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update session with exit details
      const updatedSession = await tx.parkingSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          exitTime,
          durationMinutes,
          totalAmount,
          status: "COMPLETED",
        },
      });

      // Generate bill
      const bill = await tx.bill.create({
        data: {
          sessionId: updatedSession.id,
          userId: session.userId || session.vehicle.userId,
          vehicleId: session.vehicleId,
          parkingId: session.parkingId,
          totalAmount,
          status: "PENDING",
        },
      });

      // Free up parking lot
      await tx.parkingLot.update({
        where: { id: session.parkingLotId },
        data: { isOccupied: false },
      });

      // Update available spaces
      await tx.parking.update({
        where: { id: session.parkingId },
        data: {
          availableSpaces: {
            increment: 1,
          },
        },
      });

      return { session: updatedSession, bill };
    });

    return ServerResponse.success(
      res,
      "Parking session completed successfully",
      result
    );
  } catch (error) {
    console.error("Error ending parking session:", error);
    return ServerResponse.error(res, "Error ending parking session", error);
  }
};

// Get all active parking sessions
const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.parkingSession.findMany({
      where: { status: "ACTIVE" },
      include: {
        vehicle: true,
        parking: true,
        parkingLot: true,
        user: true,
      },
    });

    return ServerResponse.success(res, "Active sessions retrieved", sessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return ServerResponse.error(res, "Error fetching active sessions", error);
  }
};

// Get session details by ID
const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.parkingSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        vehicle: true,
        parking: true,
        parkingLot: true,
        user: true,
        ticket: true,
        bill: true,
      },
    });

    if (!session) {
      return ServerResponse.error(res, "Session not found");
    }

    return ServerResponse.success(res, "Session details retrieved", session);
  } catch (error) {
    console.error("Error fetching session details:", error);
    return ServerResponse.error(res, "Error fetching session details", error);
  }
};

// Get sessions by parking ID
const getSessionsByParking = async (req: Request, res: Response) => {
  try {
    const { parkingId } = req.params;
    const { status, date } = req.query;

    const where: any = { parkingId: parseInt(parkingId) };

    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.entryTime = { gte: startDate, lte: endDate };
    }

    const sessions = await prisma.parkingSession.findMany({
      where,
      include: {
        vehicle: true,
        parkingLot: true,
      },
      orderBy: { entryTime: "desc" },
    });

    return ServerResponse.success(res, "Parking sessions retrieved", sessions);
  } catch (error) {
    console.error("Error fetching parking sessions:", error);
    return ServerResponse.error(res, "Error fetching parking sessions", error);
  }
};

export default {
  startParkingSession,
  endParkingSession,
  getActiveSessions,
  getSessionDetails,
  getSessionsByParking,
};
