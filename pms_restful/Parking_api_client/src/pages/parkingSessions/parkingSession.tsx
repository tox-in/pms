import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  getActiveParkingSessions,
  endParkingSession,
} from "../../services/parkingSession";
import toast from "react-hot-toast";
import { getVehicles } from "../../services/vehicle";
import { getAllParkings } from "../../services/parking";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { Helmet } from "react-helmet";
import { BiEdit, BiSearch, BiTrash } from "react-icons/bi";
import { Modal, Select, Button, ConfirmModal } from "@mantine/core";
import { MdCancel } from "react-icons/md";
import { debounce } from "lodash";
import { IParkingSession, IVehicle, IParking, IMeta, IUser } from "../../types";

// Define context type
interface CommonContextType {
  user: IUser | null;
  parkingSessions: IParkingSession[];
  setParkingSessions: React.Dispatch<React.SetStateAction<IParkingSession[]>>;
  setMeta: React.Dispatch<React.SetStateAction<IMeta>>;
  meta: IMeta;
}

// Create context
export const CommonContext = createContext<CommonContextType | undefined>(
  undefined
);

// Define update form data
type UpdateSessionData = {
  vehicleId: string;
  parkingId: string;
};

const ParkingSessions: React.FC = () => {
  const context = useContext(CommonContext);
  if (!context) {
    throw new Error(
      "ParkingSessions must be used within a CommonContext Provider"
    );
  }
  const { user, parkingSessions, setParkingSessions, setMeta, meta } = context;
  const isAdmin = user?.role === "ADMIN";

  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchKey, setSearchKey] = useState<string>("");
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [parkings, setParkings] = useState<IParking[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] =
    useState<IParkingSession | null>(null);
  const [formData, setFormData] = useState<UpdateSessionData>({
    vehicleId: "",
    parkingId: "",
  });
  const [actionType, setActionType] = useState<"delete" | "end" | null>(null);
  const [actionSessionId, setActionSessionId] = useState<number | null>(null);

  const columns: DataTableColumn<IParkingSession>[] = [
    {
      accessor: "id",
      title: "#",
      render: (_, index) => index + 1 + (page - 1) * limit,
    },
    {
      accessor: "vehicle.plate",
      title: "Vehicle Plate",
      sortable: true,
      render: ({ vehicle }) => vehicle?.plate || "-",
    },
    {
      accessor: "vehicle.model",
      title: "Vehicle Model",
      sortable: true,
      render: ({ vehicle }) => vehicle?.model || "-",
    },
    {
      accessor: "parking.parkingCode",
      title: "Parking Facility",
      render: ({ parking }) => parking?.parkingCode || "-",
    },
    {
      accessor: "status",
      title: "Status",
      sortable: true,
      render: ({ status }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      accessor: "startTime",
      title: "Started At",
      render: ({ startTime }) => new Date(startTime).toLocaleString(),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (record) =>
        record.status === "active" ? (
          <div className="flex gap-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  setActionType("end");
                  setActionSessionId(record.id);
                  setShowConfirmModal(true);
                }}
                className="text-red-500"
                disabled={actionLoading}
              >
                <MdCancel size={25} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedSession(record);
                    setFormData({
                      vehicleId: record.vehicleId.toString(),
                      parkingId: record.parkingId.toString(),
                    });
                    setShowUpdateModal(true);
                  }}
                  className="text-blue-500"
                  disabled={actionLoading}
                >
                  <BiEdit size={20} />
                </button>
                <button
                  onClick={() => {
                    setActionType("delete");
                    setActionSessionId(record.id);
                    setShowConfirmModal(true);
                  }}
                  className="text-red-500"
                  disabled={actionLoading}
                >
                  <BiTrash size={20} />
                </button>
              </>
            )}
          </div>
        ) : null,
    },
  ];

  const fetchParkingSessions = async () => {
    try {
      await getActiveParkingSessions({
        page,
        limit,
        setLoading,
        setMeta,
        setSessions: setParkingSessions,
        searchKey,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch active parking sessions");
    }
  };

  const fetchVehicles = async () => {
    try {
      await getVehicles({
        page: 1,
        limit: 20,
        setLoading,
        setMeta: () => {},
        setVehicles,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load vehicles");
    }
  };

  const fetchParkings = async () => {
    try {
      await getAllParkings({
        page: 1,
        limit: 20,
        setLoading,
        setMeta: () => {},
        setParkings,
        searchKey: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load parking facilities");
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchParkingSessions();
    }, 500),
    [page, limit, searchKey]
  );

  const handleUpdate = async () => {
    if (!selectedSession || !formData.vehicleId || !formData.parkingId) {
      toast.error("Please select a vehicle and parking facility");
      return;
    }
    try {
      const updated = await updateParkingSession({
        sessionId: selectedSession.id,
        sessionData: {
          vehicleId: parseInt(formData.vehicleId),
          parkingId: parseInt(formData.parkingId),
        },
        setLoading: setActionLoading,
      });
      if (updated) {
        toast.success("Parking session updated successfully");
        setShowUpdateModal(false);
        setSelectedSession(null);
        setFormData({ vehicleId: "", parkingId: "" });
        fetchParkingSessions();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update parking session");
    }
  };

  const handleDelete = async (sessionId: number) => {
    try {
      const success = await deleteParkingSession({
        sessionId,
        setLoading: setActionLoading,
      });
      if (success) {
        toast.success("Parking session canceled successfully");
        fetchParkingSessions();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel parking session");
    }
  };

  const handleEnd = async (sessionId: number) => {
    try {
      const result = await endParkingSession({
        sessionId,
        setLoading: setActionLoading,
      });
      if (result) {
        toast.success("Parking session ended successfully");
        fetchParkingSessions();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to end parking session");
    }
  };

  const handleConfirmAction = async () => {
    if (!actionSessionId || !actionType) return;
    if (actionType === "delete") {
      await handleDelete(actionSessionId);
    } else if (actionType === "end") {
      await handleEnd(actionSessionId);
    }
    setShowConfirmModal(false);
    setActionSessionId(null);
    setActionType(null);
  };

  useEffect(() => {
    fetchParkingSessions();
    if (!isAdmin) {
      fetchVehicles();
      fetchParkings();
    }
  }, [page, limit, isAdmin]);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchKey]);

  return (
    <div className="w-full flex min-h-screen">
      <Sidebar />
      <Helmet>
        <title>Parking Sessions</title>
      </Helmet>
      <div className="w-10/12 flex flex-col">
        <Header />
        <div className="my-14 mx-1 md:mx-4">
          <div className="w-full justify-between flex items-center mb-6">
            <span className="text-xl">Your Active Parking Sessions</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by vehicle plate or parking code..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && debouncedSearch()}
              className="px-4 py-3 rounded-lg border flex-grow"
            />
            <button
              onClick={() => debouncedSearch()}
              className="bg-primary-blue flex items-center justify-center px-4 rounded-lg text-white"
              disabled={loading}
            >
              <BiSearch size={20} />
            </button>
          </div>

          <DataTable
            records={parkingSessions}
            columns={columns}
            page={page}
            recordsPerPage={limit}
            loadingText={loading ? "Loading..." : "Rendering..."}
            onPageChange={setPage}
            onRecordsPerPageChange={setLimit}
            recordsPerPageOptions={[5, 10, 20, 50]}
            withTableBorder
            borderRadius="sm"
            withColumnBorders
            striped
            styles={{
              table: { fontSize: "18px" },
            }}
            totalRecords={meta?.total}
            highlightOnHover
            noRecordsText="No active parking sessions found"
          />

          {!isAdmin && (
            <Modal
              opened={showUpdateModal}
              onClose={() => {
                setShowUpdateModal(false);
                setSelectedSession(null);
                setFormData({ vehicleId: "", parkingId: "" });
              }}
              title="Update Parking Session"
            >
              <div className="space-y-4">
                <Select
                  label="Select Vehicle"
                  placeholder="Choose a vehicle"
                  data={vehicles.map((vehicle) => ({
                    value: vehicle.id.toString(),
                    label: `${vehicle.plate} ${
                      vehicle.model ? `- ${vehicle.model}` : ""
                    }`,
                  }))}
                  value={formData.vehicleId}
                  onChange={(value) =>
                    setFormData({ ...formData, vehicleId: value || "" })
                  }
                  disabled={vehicles.length === 0}
                  error={
                    vehicles.length === 0 ? "No vehicles available" : undefined
                  }
                />
                <Select
                  label="Select Parking Facility"
                  placeholder="Choose a parking facility"
                  data={parkings.map((parking) => ({
                    value: parking.id.toString(),
                    label: `${parking.parkingCode} ${
                      parking.name ? `- ${parking.name}` : ""
                    }`,
                  }))}
                  value={formData.parkingId}
                  onChange={(value) =>
                    setFormData({ ...formData, parkingId: value || "" })
                  }
                  disabled={parkings.length === 0}
                  error={
                    parkings.length === 0
                      ? "No parking facilities available"
                      : undefined
                  }
                />
                <Button
                  onClick={handleUpdate}
                  className="mt-4 bg-primary-blue text-white"
                  disabled={
                    !formData.vehicleId || !formData.parkingId || actionLoading
                  }
                  loading={actionLoading}
                >
                  Update
                </Button>
              </div>
            </Modal>
          )}

          <ConfirmModal
            opened={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setActionSessionId(null);
              setActionType(null);
            }}
            title={
              actionType === "delete"
                ? "Cancel Parking Session"
                : "End Parking Session"
            }
            description={
              actionType === "delete"
                ? "Are you sure you want to cancel this parking session?"
                : "Are you sure you want to end this parking session?"
            }
            confirmLabel={
              actionType === "delete" ? "Cancel Session" : "End Session"
            }
            cancelLabel="Back"
            onConfirm={handleConfirmAction}
            confirmProps={{ color: actionType === "delete" ? "red" : "blue" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ParkingSessions;
