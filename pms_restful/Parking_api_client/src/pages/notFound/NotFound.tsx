import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FiAlertCircle, FiHome } from "react-icons/fi";
import { Helmet } from "react-helmet";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      <Helmet>
        <title>Page Not Found | PMS</title>
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <div className="flex justify-center text-white mb-3">
            <FiAlertCircle size={48} className="text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        </div>

        <div className="p-6 text-center space-y-5">
          <p className="text-gray-600">
            The page{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {location.pathname}
            </code>{" "}
            doesn't exist or has been moved.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
            >
              <FiHome size={18} />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
