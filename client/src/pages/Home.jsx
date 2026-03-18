import { AlertCircle, CheckCircle, Clock, Users, Ticket, Activity, MessageCircleWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DARKGREEN, ORANGE, PRIMARY_COLOR } from "../components/Color";
import { isAuth } from "../utils/helpers";

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <div className="rounded-xl p-3 text-white shadow-lg" style={{ background: gradient }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {Icon && (
        <div className="bg-white/20 p-2 rounded-lg">
          <Icon size={24} />
        </div>
      )}
    </div>
  </div>
);

const QuickAction = ({ label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition cursor-pointer"
  >
    {Icon && (
      <div className="p-1.5 rounded-lg text-white" style={{ background: PRIMARY_COLOR }}>
        <Icon size={16} />
      </div>
    )}
    <span className="text-xs font-semibold text-gray-700">{label}</span>
  </button>
);

const Home = () => {
  const navigate = useNavigate();
  const user = isAuth();

  const ROLE_CONFIG = {
    ADMIN: {
      actions: [
        { label: "Users", route: "/users", icon: Users },
        { label: "Create Ticket", route: "/tickets/create", icon: Ticket },
        { label: "Service Tracking", route: "/service-tracking", icon: Activity },
        { label: "Complaint Escalation", route: "/complaint-escalation", icon: MessageCircleWarning },
      ],
    },
    L1: {
      actions: [{ label: "Create Ticket", route: "/tickets/create", icon: Ticket }],
    },
    L2: {
      actions: [{ label: "Service Tracking", route: "/service-tracking", icon: Activity }],
    },
    L3: {
      actions: [{ label: "Complaint Escalation", route: "/complaint-escalation", icon: MessageCircleWarning }],
    },
  };
  const actions = ROLE_CONFIG[user.role]?.actions || [];
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-2">
        <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
          Dashboard
        </h2>
        {/* <p className="text-sm text-gray-600 mt-1">Welcome to Complaint Management System</p> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Tickets" value="1,248" icon={AlertCircle} gradient="linear-gradient(135deg, #1c2649 0%, #1c2649dd 100%)" />
        <StatCard title="Open Tickets" value="312" icon={Clock} gradient={`linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE} 100%)`} />
        <StatCard
          title="Resolved Today"
          value="86"
          icon={CheckCircle}
          gradient={`linear-gradient(135deg,${DARKGREEN} 0%, ${DARKGREEN} 100%)`}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {actions.map((action, index) => (
            <QuickAction key={index} label={action.label} icon={action.icon} onClick={() => navigate(action.route)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
