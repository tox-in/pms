import { CommonContext } from "../context";
import { logout } from "../redux/slices/userReducer";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FiHome, FiLogOut, FiSmartphone } from "react-icons/fi";

const MobileSidebar: React.FC = () => {
  const { setShowSidebar } = useContext(CommonContext);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="fixed backdrop-blur-sm w-screen h-screen flex items-center flex-col z-10 bg-black/40">
      <div
        className="w-full h-full absolute z-20"
        onClick={() => setShowSidebar(false)}
      ></div>
      <div className="bg-white p-8 w-11/12 mmsm:w-10/12 sm:w-7/12 flex flex-col rounded-b-2xl">
        {/* Header with Smart-Park branding */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <FiSmartphone className="text-xl text-blue-600" />
          <span className="font-bold text-xl text-center text-slate-800">
            Smart-Park
          </span>
        </div>

        <div className="my-4 flex flex-col">
          <Link
            to={"/"}
            className={`flex items-center rounded-lg p-3 hover:bg-slate-200 ${
              window.location.pathname === "/" ? "bg-slate-200" : ""
            }`}
          >
            <FiHome size={20} className="text-slate-600" />
            <span className="ml-3 text-lg text-slate-700">Dashboard</span>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center rounded-lg p-3 hover:bg-slate-200 mt-4"
        >
          <FiLogOut size={20} className="text-slate-600" />
          <span className="ml-3 text-lg text-slate-700">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSidebar;
