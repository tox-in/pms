import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { BiLoaderAlt } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import { createVehicle, getMyVehicles } from "../services/vehicle";
import { CommonContext } from "../context";

const VehicleSchema = yup.object({
  plate: yup.string().required().label("Plate Number"),
  type: yup
    .string()
    .oneOf(["car", "motorcycle", "truck", "van", "suv"])
    .optional(),
  size: yup.string().oneOf(["small", "medium", "large"]).optional(),
  model: yup.string().optional(),
  color: yup.string().optional(),
});

type VehicleData = yup.InferType<typeof VehicleSchema>;

const CreateVehicle: React.FC = () => {
  const context = useContext(CommonContext);
  if (!context) throw new Error("Must be used within CommonContext Provider");

  const { setShowCreateVehicle, setVehicles } = context;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleData>({
    resolver: yupResolver(VehicleSchema),
    mode: "onTouched",
    defaultValues: {
      plate: "",
      type: undefined,
      size: undefined,
      model: "",
      color: "",
    },
  });

  const onSubmit: SubmitHandler<VehicleData> = async (data) => {
    setLoading(true);
    try {
      const vehicle = await createVehicle({ vehicleData: data, setLoading });
      if (vehicle) {
        await getMyVehicles({ setLoading, setVehicles });
        reset();
        setShowCreateVehicle(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={() => {
          reset();
          setShowCreateVehicle(false);
        }}
      ></div>
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl z-50 overflow-hidden">
        {/* ...form fields as before, using register and errors... */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              placeholder="RAB123G"
              {...register("plate")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.plate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.plate.message}
              </p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model (Optional)
            </label>
            <input
              type="text"
              placeholder="Toyota Prius"
              {...register("model")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.model && (
              <p className="text-xs text-red-500 mt-1">
                {errors.model.message}
              </p>
            )}
          </div>

          {/* Type and Size - Side by side on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type (Optional)
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="suv">SUV</option>
              </select>
              {errors.type && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Vehicle Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Size (Optional)
              </label>
              <select
                {...register("size")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              {errors.size && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.size.message}
                </p>
              )}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Red, Black"
              {...register("color")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.color && (
              <p className="text-xs text-red-500 mt-1">
                {errors.color.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center"
          >
            {loading ? (
              <>
                <BiLoaderAlt className="animate-spin mr-2" size={18} />
                Creating Vehicle...
              </>
            ) : (
              "Register Vehicle"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVehicle;
