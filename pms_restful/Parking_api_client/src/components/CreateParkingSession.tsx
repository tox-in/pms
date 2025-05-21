import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { BiLoaderAlt } from "react-icons/bi";
import {
  createParkingSession,
  getMySessions,
} from "../services/parkingSession";
import { CommonContext } from "../context";

const SessionSchema = yup.object({
  vehicleId: yup.string().required().label("Vehicle"),
  parkingId: yup.string().required().label("Parking"),
  startTime: yup.date().required().label("Start Time"),
  endTime: yup.date().optional().label("End Time"),
});

type SessionData = yup.InferType<typeof SessionSchema>;

const CreateParkingSession: React.FC = () => {
  const context = useContext(CommonContext);
  if (!context) throw new Error("Must be used within CommonContext Provider");

  const { setShowRequestParkingSlot, vehicles, parkings, setSessions } =
    context;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SessionData>({
    resolver: yupResolver(SessionSchema),
    mode: "onTouched",
    defaultValues: {
      vehicleId: "",
      parkingId: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: "",
    },
  });

  const onSubmit: SubmitHandler<SessionData> = async (data) => {
    setLoading(true);
    try {
      const session = await createParkingSession({
        sessionData: data,
        setLoading,
      });
      if (session) {
        await getMySessions({ setLoading, setSessions });
        reset();
        setShowRequestParkingSlot(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create session");
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
          setShowRequestParkingSlot(false);
        }}
      ></div>
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl z-50 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Vehicle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle
            </label>
            <select
              {...register("vehicleId")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} ({v.model})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.vehicleId.message}
              </p>
            )}
          </div>
          {/* Parking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking
            </label>
            <select
              {...register("parkingId")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select parking</option>
              {parkings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.parkingId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.parkingId.message}
              </p>
            )}
          </div>
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              {...register("startTime")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {errors.startTime && (
              <p className="text-xs text-red-500 mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>
          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time (Optional)
            </label>
            <input
              type="datetime-local"
              {...register("endTime")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {errors.endTime && (
              <p className="text-xs text-red-500 mt-1">
                {errors.endTime.message}
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
                Creating Session...
              </>
            ) : (
              "Request Parking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateParkingSession;
