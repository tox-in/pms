import { logout } from "../redux/slices/userReducer";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CommonContext } from "../context";
import { FaCarAlt } from "react-icons/fa";
import {
  FiHome,
  FiUser,
  FiMapPin,
  FiClock,
  FiLogOut,
  FiSmartphone,
} from "react-icons/fi";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useContext(CommonContext);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-2/12 pt-10 pb-4 smlg:flex flex flex-col justify-between min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-2 md:px-4">
      <div className="flex flex-col">
        {/* Enhanced Header Section */}
        <div className="flex flex-col items-center mb-8 px-2 py-4">
          <div className="flex items-center justify-center space-x-2">
            <FaCarAlt className="text-2xl text-blue-200" />
            <span className="font-bold text-2xl text-white">Smart-Park</span>
          </div>
          <span className="text-sm text-blue-200 mt-1 hidden mlg:block">
            Parking Management System
          </span>
        </div>

        {/* Rest of the sidebar (unchanged from your original) */}
        <div className="my-4 flex flex-col pt-14">
          <Link
            to={"/"}
            className={`flex items-center rounded-lg p-3 hover:bg-slate-300/60`}
          >
            <FiHome size={23} className="text-white min-h-6 min-w-6" />
            <span className="ml-2 text-lg truncate whitespace-nowrap overflow-hidden hidden mlg:block text-neutral-200">
              Vehicles
            </span>
          </Link>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center rounded-lg p-3 hover:bg-slate-300/60"
        >
          <FiUser size={23} className="text-white min-h-6 min-w-6" />
          <span className="ml-2 text-lg truncate whitespace-nowrap overflow-hidden hidden mlg:block text-neutral-200">
            profile
          </span>
        </button>
        <button
          onClick={() => navigate("/parkingSlot")}
          className="flex items-center rounded-lg p-3 hover:bg-slate-300/60"
        >
          <FiMapPin size={23} className="text-white min-h-6 min-w-6" />
          <span className="ml-2 text-lg truncate whitespace-nowrap overflow-hidden hidden mlg:block text-neutral-200">
            parkingSlot
          </span>
        </button>
        <button
          onClick={() => navigate("/requestSlot")}
          className="flex items-center rounded-lg p-3 hover:bg-slate-300/60"
        >
          <FiClock size={23} className="text-white min-h-6 min-w-6" />
          <span className="ml-2 truncate whitespace-nowrap overflow-hidden text-lg hidden mlg:block text-clip text-neutral-200">
            requested Slots
          </span>
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="flex font-bold items-center rounded-lg p-3 hover:bg-slate-300/60"
      >
        <FiLogOut
          size={30}
          className="text-white font-extrabold min-h-4 min-w-4"
        />
        <span className="ml-2 text-lg hidden truncate whitespace-nowrap overflow-hidden mlg:block text-neutral-200">
          Logout
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
