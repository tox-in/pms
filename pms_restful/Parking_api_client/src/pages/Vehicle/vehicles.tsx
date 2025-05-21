import Sidebar from "../../components/Sidebar";
import { CommonContext } from "../../context";
import {
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../../services/vehicle";
import { DataTable, DataTableColumn } from "mantine-datatable";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Modal, TextInput, Select, Button } from "@mantine/core";
import { Menu, ActionIcon } from "@mantine/core";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FiMoreVertical, FiPlus, FiSearch } from "react-icons/fi";
import { IVehicle } from "../../types";
import Header from "../../components/Header";
import toast from "react-hot-toast";

const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchKey, setSearchKey] = useState<string>("");
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [formData, setFormData] = useState<Partial<IVehicle>>({});

  const { setShowCreateVehicle, vehicles, setVehicles, setMeta, meta } =
    useContext(CommonContext);

  const columns: DataTableColumn<IVehicle>[] = [
    {
      accessor: "id",
      title: "#",
      render: (_, index) => index + 1 + (page - 1) * limit,
    },
    {
      accessor: "plate",
      title: "Plate Number",
      sortable: true,
      render: ({ plate }) => (
        <span className="uppercase font-medium">{plate}</span>
      ),
    },
    {
      accessor: "model",
      title: "Model",
      sortable: true,
      render: ({ model }) => <span>{model}</span>,
    },
    {
      accessor: "color",
      title: "Color",
      sortable: true,
      render: ({ color }) => <span className="capitalize">{color}</span>,
    },
    {
      accessor: "size",
      title: "Size",
      sortable: true,
      render: ({ size }) => <span className="capitalize">{size}</span>,
    },
    {
      accessor: "type",
      title: "Type",
      sortable: true,
      render: ({ type }) => <span className="capitalize">{type}</span>,
    },
    {
      accessor: "actions",
      title: "",
      width: 50,
      render: (record) => (
        <Menu shadow="md" width={150} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <FiMoreVertical size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                setSelectedVehicle(record);
                setFormData({
                  plate: record.plate,
                  model: record.model,
                  color: record.color,
                  size: record.size,
                  type: record.type,
                });
                setShowUpdateModal(true);
              }}
              leftSection={<FiEdit size={14} />}
            >
              Update
            </Menu.Item>
            <Menu.Item
              onClick={() => handleDelete(record.id!)}
              color="red"
              leftSection={<FiTrash2 size={14} />}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    fetchVehicles();
  };

  const fetchVehicles = async () => {
    try {
      await getVehicles({
        page,
        limit,
        setLoading,
        setMeta,
        setVehicles,
        searchKey,
      });
    } catch (error) {
      toast.error("Failed to load vehicles");
    }
  };

  const handleUpdate = async () => {
    if (!selectedVehicle || !formData.plate) return;
    try {
      const updated = await updateVehicle({
        vehicleId: selectedVehicle.id!,
        vehicleData: formData,
        setLoading: setActionLoading,
        setShowUpdateVehicle: setShowUpdateModal,
      });
      if (updated) {
        toast.success("Vehicle updated successfully");
        setSelectedVehicle(null);
        setFormData({});
        fetchVehicles();
      }
    } catch (error) {
      toast.error("Failed to update vehicle");
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const success = await deleteVehicle({
          vehicleId,
          setLoading: setActionLoading,
        });
        if (success) {
          toast.success("Vehicle deleted successfully");
          fetchVehicles();
        }
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, limit]);

  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      <Sidebar />
      <Helmet>
        <title>My Vehicles | Smart-Park</title>
      </Helmet>
      <div className="w-10/12 flex flex-col">
        <Header />
        <div className="my-8 mx-4 md:mx-8">
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Vehicles</h1>
            <button
              onClick={() => setShowCreateVehicle(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <FiPlus className="mr-2" size={18} />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            <TextInput
              placeholder="Search by plate or model..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              rightSection={
                <button
                  onClick={handleSearch}
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
              records={vehicles}
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
              noRecordsText="No vehicles found"
              loading={loading}
              loaderSize="lg"
              loaderVariant="dots"
              loaderColor="blue"
              minHeight={200}
            />
          </div>

          <Modal
            opened={showUpdateModal}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedVehicle(null);
              setFormData({});
            }}
            title={<span className="font-bold text-lg">Update Vehicle</span>}
            centered
            overlayProps={{
              blur: 3,
            }}
          >
            <div className="space-y-4">
              <TextInput
                label="Plate Number"
                placeholder="Enter plate number"
                value={formData.plate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, plate: e.target.value })
                }
                required
              />
              <TextInput
                label="Model"
                placeholder="Enter model"
                value={formData.model || ""}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
              <TextInput
                label="Color"
                placeholder="Enter color"
                value={formData.color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
              <Select
                label="Size"
                placeholder="Select size"
                data={["small", "medium", "large"]}
                value={formData.size || ""}
                onChange={(value) =>
                  setFormData({ ...formData, size: value || "" })
                }
              />
              <Select
                label="Type"
                placeholder="Select type"
                data={["car", "truck", "motorcycle"]}
                value={formData.type || ""}
                onChange={(value) =>
                  setFormData({ ...formData, type: value || "" })
                }
              />
              <Button
                onClick={handleUpdate}
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                disabled={!formData.plate || actionLoading}
                loading={actionLoading}
              >
                Update Vehicle
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Home;
