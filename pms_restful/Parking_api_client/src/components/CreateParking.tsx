import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { BiLoaderAlt } from "react-icons/bi";
import { createParking, getMyParkings } from "../services/parking";
import { CommonContext } from "../context";

const ParkingSchema = yup.object({
  name: yup.string().required().label("Parking Name"),
  location: yup.string().required().label("Location"),
  capacity: yup.number().required().min(1).label("Capacity"),
});

type ParkingData = yup.InferType<typeof ParkingSchema>;

const CreateParking: React.FC = () => {
  const context = useContext(CommonContext);
  if (!context) throw new Error("Must be used within CommonContext Provider");

  const { setShowCreateParkingSlot, setParkings } = context;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ParkingData>({
    resolver: yupResolver(ParkingSchema),
    mode: "onTouched",
    defaultValues: { name: "", location: "", capacity: 1 },
  });

  const onSubmit: SubmitHandler<ParkingData> = async (data) => {
    setLoading(true);
    try {
      const parking = await createParking({ parkingData: data, setLoading });
      if (parking) {
        await getMyParkings({ setLoading, setParkings });
        reset();
        setShowCreateParkingSlot(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create parking");
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
          setShowCreateParkingSlot(false);
        }}
      ></div>
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl z-50 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Parking Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              {...register("location")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              {...register("capacity")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.capacity.message}
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
                Creating Parking...
              </>
            ) : (
              "Register Parking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateParking;
