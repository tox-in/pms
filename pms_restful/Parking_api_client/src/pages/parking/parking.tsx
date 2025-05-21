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
  getAllParkings,
  updateParking,
  deleteParking,
} from "../../services/parking";
import { DataTable, DataTableColumn } from "mantine-datatable";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import { FiEdit, FiPlus, FiSearch } from "react-icons/fi";
import { Modal, TextInput, Select, Button, ConfirmModal } from "@mantine/core";
import { debounce } from "lodash";
import { IParking, IMeta, IUser } from "../../types";

// Define context type
interface CommonContextType {
  user: IUser | null;
  setShowCreateParking: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateParkingSession: React.Dispatch<React.SetStateAction<boolean>>;
  parkings: IParking[];
  setParkings: React.Dispatch<React.SetStateAction<IParking[]>>;
  setMeta: React.Dispatch<React.SetStateAction<IMeta>>;
  meta: IMeta;
}

// Create context
export const CommonContext = createContext<CommonContextType | undefined>(
  undefined
);

// Define update form data type (aligned with UpdateParkingDTO)
type UpdateParkingData = {
  parkingCode?: string;
  name?: string;
  location?: string;
  feePerHour?: number;
  status?: "available" | "unavailable";
};

const ParkingList: React.FC = () => {
  const context = useContext(CommonContext);
  if (!context) {
    throw new Error("ParkingList must be used within a CommonContext Provider");
  }
  const {
    user,
    setShowCreateParking,
    setShowCreateParkingSession,
    parkings,
    setParkings,
    setMeta,
    meta,
  } = context;

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchKey, setSearchKey] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState<IParking | null>(null);
  const [formData, setFormData] = useState<UpdateParkingData>({});
  const [parkingToDelete, setParkingToDelete] = useState<number | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const columns: DataTableColumn<IParking>[] = [
    {
      accessor: "id",
      title: "#",
      render: (_, index) => index + 1 + (page - 1) * limit,
    },
    {
      accessor: "parkingCode",
      title: "Parking Code",
      sortable: true,
    },
    {
      accessor: "name",
      title: "Name",
      sortable: true,
      render: ({ name }) => name || "-",
    },
    {
      accessor: "totalSpaces",
      title: "Total Spaces",
      sortable: true,
    },
    {
      accessor: "availableSpaces",
      title: "Available Spaces",
      sortable: true,
    },
    {
      accessor: "location",
      title: "Location",
      sortable: true,
      render: ({ location }) => location || "-",
    },
    {
      accessor: "feePerHour",
      title: "Fee/Hour",
      sortable: true,
      render: ({ feePerHour }) =>
        feePerHour ? `$${feePerHour.toFixed(2)}` : "-",
    },
    {
      accessor: "status",
      title: "Status",
      sortable: true,
      render: ({ status }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "available"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      hidden: !isAdmin,
      render: (record) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedParking(record);
              setFormData({
                parkingCode: record.parkingCode,
                name: record.name,
                location: record.location,
                feePerHour: record.feePerHour,
                status: record.status,
              });
              setShowUpdateModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            disabled={actionLoading}
          >
            <FiEdit size={20} />
          </button>
          <button
            onClick={() => {
              setParkingToDelete(record.id);
              setShowConfirmModal(true);
            }}
            className="text-red-600 hover:text-red-800 transition-colors"
            disabled={actionLoading}
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  const fetchParkings = async () => {
    try {
      await getAllParkings({
        page,
        limit,
        setLoading,
        setMeta,
        setParkings,
        searchKey,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch parking facilities");
    }
  };

  // Debounce search to reduce API calls
  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchParkings();
    }, 500),
    [page, limit, searchKey]
  );

  const handleUpdate = async () => {
    if (!selectedParking) return;
    try {
      const updated = await updateParking({
        parkingId: selectedParking.id,
        parkingData: formData,
        setLoading: setActionLoading,
        setShowUpdateParking: setShowUpdateModal,
      });
      if (updated) {
        fetchParkings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update parking facility");
    }
  };

  const handleDelete = async () => {
    if (!parkingToDelete) return;
    try {
      const success = await deleteParking({
        parkingId: parkingToDelete,
        setLoading: setActionLoading,
      });
      if (success) {
        fetchParkings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete parking facility");
    } finally {
      setParkingToDelete(null);
      setShowConfirmModal(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, [page, limit]);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchKey]);

  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      <Sidebar />
      <Helmet>
        <title>Parking Facilities | Smart-Park</title>
      </Helmet>
      <div className="w-10/12 flex flex-col">
        <Header />
        <div className="my-8 mx-4 md:mx-8">
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Parking Facilities
            </h1>
            {isAdmin ? (
              <button
                onClick={() => setShowCreateParking(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <FiPlus className="mr-2" size={18} />
                <span>Add New Facility</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateParkingSession(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <FiPlus className="mr-2" size={18} />
                <span>Start Parking Session</span>
              </button>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <TextInput
              placeholder="Search by parking code, name, or location..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && debouncedSearch()}
              rightSection={
                <button
                  onClick={() => debouncedSearch()}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  disabled={loading}
                >
                  <FiSearch size={18} />
                </button>
              }
              className="flex-grow"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              records={parkings}
              columns={columns}
              page={page}
              recordsPerPage={limit}
              onPageChange={setPage}
              onRecordsPerPageChange={setLimit}
              recordsPerPageOptions={[5, 10, 20, 50]}
              withTableBorder
              borderRadius="md"
              withColumnBorders
              striped
              highlightOnHover
              totalRecords={meta?.total}
              noRecordsText="No parking facilities found"
              loading={loading}
              loaderSize="lg"
              loaderVariant="dots"
              loaderColor="blue"
              minHeight={200}
            />
          </div>

          {isAdmin && (
            <>
              <Modal
                opened={showUpdateModal}
                onClose={() => {
                  setShowUpdateModal(false);
                  setSelectedParking(null);
                  setFormData({});
                }}
                title={
                  <span className="font-bold text-lg">
                    Update Parking Facility
                  </span>
                }
                centered
                overlayProps={{
                  blur: 3,
                }}
              >
                <div className="space-y-4">
                  <TextInput
                    label="Parking Code"
                    placeholder="Enter parking code"
                    value={formData.parkingCode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, parkingCode: e.target.value })
                    }
                  />
                  <TextInput
                    label="Name"
                    placeholder="Enter name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <TextInput
                    label="Location"
                    placeholder="Enter location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                  <TextInput
                    label="Fee Per Hour"
                    placeholder="Enter fee per hour"
                    type="number"
                    step="0.01"
                    value={
                      formData.feePerHour !== undefined
                        ? formData.feePerHour
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        feePerHour: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                  />
                  <Select
                    label="Status"
                    placeholder="Select status"
                    data={["available", "unavailable"]}
                    value={formData.status || ""}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "available" | "unavailable",
                      })
                    }
                  />
                  <Button
                    onClick={handleUpdate}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                    disabled={actionLoading}
                    loading={actionLoading}
                  >
                    Update Facility
                  </Button>
                </div>
              </Modal>

              <ConfirmModal
                opened={showConfirmModal}
                onClose={() => {
                  setShowConfirmModal(false);
                  setParkingToDelete(null);
                }}
                title="Confirm Deletion"
                description="Are you sure you want to delete this parking facility? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                confirmProps={{ color: "red" }}
                centered
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingList;
