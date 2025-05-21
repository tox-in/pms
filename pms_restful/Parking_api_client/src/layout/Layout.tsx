import CreateParkingSlot from "../components/CreateParking";
import CreateVehicle from "../components/CreateVehicle";
import CreateRequestSlot from "../components/CreateParkingSession";
import { CommonContext } from "../context";
import React, { useContext } from "react";

const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { showCreateVehicle, showCreateParkingSlot, showRequestParkingSlot } =
    useContext(CommonContext);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Modal Overlays */}
      {showCreateVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <CreateVehicle />
        </div>
      )}

      {showCreateParkingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <CreateParkingSlot />
        </div>
      )}

      {showRequestParkingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <CreateRequestSlot />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
