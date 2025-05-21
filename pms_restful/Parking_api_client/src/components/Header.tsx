import { CommonContext } from "../context";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";

export default function Header() {
  const { user } = useContext(CommonContext);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-5 flex justify-between items-center shadow-md">
      {/* Welcome message */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-gray-100">
          <span className="underline">{user?.firstName}</span> the{" "}
          <span className="underline">{user?.role}</span>
        </span>
      </div>

      {/* User info */}
      <div className="flex items-center space-x-4">
        {/* Role badge */}
        <span className="px-3 py-1 bg-blue-500/30 text-blue-100 text-sm font-medium rounded-md">
          {user?.role}
        </span>

        {/* Profile link */}
        <Link to="/profile" className="flex items-center space-x-2 group">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 group-hover:border-white transition-colors"
              alt="Profile"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center border-2 border-blue-200 group-hover:border-white transition-colors">
              <FiUser className="text-white text-lg" />
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
