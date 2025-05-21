import { Request, Response } from "express";
import prisma from "../prisma/prisma-client";
import ServerResponse from "../utils/ServerResponse";

const createParking = async (req: Request, res: Response) => {
  try {
    const { parkingCode, name, totalSpaces, location, feePerHour, status } =
      req.body;

    if (!parkingCode || !totalSpaces) {
      return ServerResponse.error(
        res,
        "parkingCode and totalSpaces are required"
      );
    }

    // parkingCode exists?
    const existingParking = await prisma.parking.findUnique({
      where: { parkingCode },
    });
    if (existingParking) {
      return ServerResponse.error(res, "Parking with this code already exists");
    }

    const parkingLots = Array.from({ length: totalSpaces }, (_, i) => ({
      lotNumber: `${parkingCode}-${i + 1}`,
      isOccupied: false,
    }));

    // define parking with lots
    const newParking = await prisma.parking.create({
      data: {
        parkingCode,
        name: name || "Public Parking",
        availableSpaces: totalSpaces,
        totalSpaces,
        location: location || "Unknown location",
        feePerHour: feePerHour || 100,
        status: status || "AVAILABLE",
        parkingLots: {
          create: parkingLots,
        },
      },
      include: {
        parkingLots: true,
      },
    });

    return ServerResponse.success(
      res,
      "Parking created successfully",
      newParking
    );
  } catch (error) {
    console.error(error);
    return ServerResponse.error(
      res,
      "Failed to create parking facility",
      error
    );
  }
};

const getAllParkings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchKey =
      ((req.query.searchkey || req.query.searchKey) as string)?.trim() || "";

    console.log("Received searchKey for parkings:", searchKey); // Debug log

    const skip = (page - 1) * limit;

    // base where condition
    const whereCondition: any = {};

    if (searchKey) {
      whereCondition.OR = [
        { slotCode: { contains: searchKey, mode: "insensitive" } },
        { vehicleType: { contains: searchKey, mode: "insensitive" } },
        { size: { contains: searchKey, mode: "insensitive" } },
      ];
    }

    console.log("whereCondition:", JSON.stringify(whereCondition, null, 2));

    const [parkings, total] = await Promise.all([
      prisma.parking.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      prisma.parking.count({
        where: whereCondition,
      }),
    ]);

    return ServerResponse.success(res, "Parkings fetched", {
      parkings,
      meta: {
        page,
        limit,
        total,
        searchKey: searchKey || null,
      },
    });
  } catch (error) {
    console.error("Error fetching parking slots:", error);
    return ServerResponse.error(res, "Error fetching parking slots", { error });
  }
};

const updateParking = async (req: Request, res: Response) => {
  try {
    const { parkingId } = req.params;
    const { parkingCode, name, location, feePerHour, status } = req.body;

    if (!parkingId) {
      return ServerResponse.error(res, "Parking ID is required");
    }

    const updatedParking = await prisma.parking.update({
      where: { id: parseInt(parkingId) },
      data: {
        parkingCode,
        name,
        location,
        feePerHour,
        status,
      },
    });

    return ServerResponse.success(
      res,
      "Parking updated successfully",
      updatedParking
    );
  } catch (error) {
    console.error("Error updating parking:", error);
    return ServerResponse.error(res, "Error updating parking facility", error);
  }
};

const deleteParking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parking = await prisma.parking.findUnique({
      where: { id: Number(id) },
    });
    if (!parking) {
      return ServerResponse.error(res, "Parking not found");
    }
    await prisma.parking.delete({
      where: { id: Number(id) },
    });

    return ServerResponse.success(
      res,
      "Parking and all associated lots deleted successfully"
    );
  } catch (error) {
    return ServerResponse.error(res, "Error deleting parking", error);
  }
};

async function getAvailableParkingLots(req: Request, res: Response) {
  try {
    const { parkingId } = req.query;

    const whereCondition: any = {
      isOccupied: false,
    };

    if (parkingId) {
      whereCondition.parkingId = parseInt(parkingId as string);
    }

    const availableLots = await prisma.parkingLot.findMany({
      where: whereCondition,
      include: {
        parking: true,
      },
      orderBy: {
        lotNumber: "asc",
      },
    });

    return ServerResponse.success(
      res,
      "Available parking lots retrieved",
      availableLots
    );
  } catch (error) {
    console.error(error);
    return ServerResponse.error(
      res,
      "Failed to retrieve available parking lots",
      error
    );
  }
}

// Get parking facility with all its lots
async function getParkingWithLots(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findUnique({
      where: { id: parseInt(id) },
      include: {
        parkingLots: {
          orderBy: {
            lotNumber: "asc",
          },
        },
      },
    });

    if (!parking) {
      return ServerResponse.error(res, "Parking not found");
    }

    return ServerResponse.success(res, "Parking with lots retrieved", parking);
  } catch (error) {
    console.error(error);
    return ServerResponse.error(
      res,
      "Failed to retrieve parking with lots",
      error
    );
  }
}

const parkingController = {
  createParking,
  getAllParkings,
  deleteParking,
  updateParking,
  getAvailableParkingLots,
  getParkingWithLots,
};

export default parkingController;
