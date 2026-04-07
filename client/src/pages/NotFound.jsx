import { FileSearch, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PRIMARY_COLOR } from "../components/Color";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 mt-5  flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        {/* Icon */}
        <div
          className="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-3"
          style={{ backgroundColor: PRIMARY_COLOR + "15" }}
        >
          <FileSearch size={34} style={{ color: PRIMARY_COLOR }} />
        </div>

        {/* Code */}
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ color: PRIMARY_COLOR }}
        >
          404
        </h1>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition cursor-pointer"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <Home size={16} />
            Home
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Complaint Management System
        </p>
      </div>
    </div>
  );
};

export default NotFound;
