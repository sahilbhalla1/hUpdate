import { useState, useEffect, useMemo } from "react";
import { FilePen } from "lucide-react";
import { Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // For navigation
import api from "../../services/api";

const ComplaintOrEscalation = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/sla/l3");
      // Use the data array from your API response
      if (res.data) {
        setTickets(Array.isArray(res.data) ? res.data : res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * ROW CONTROL FUNCTION
   * This transforms your raw API data into the format needed for the columns.
   */
  const formatRows = (data) => {
    return data.map((ticket) => ({
      ...ticket,
      id: ticket.ticketId, // DataGrid needs this unique key
      ticketIdDisplay: ticket.ticketId,
      hcrmId: ticket.externalTicketNumber || "N/A",
      ticketType: ticket.orderType,
      status: ticket.ticketStatus,
      stage: ticket.ticketStage,
      createdBy: ticket.orderSource,
      createdAt: ticket.createdAt,
      sla: ticket.sla,
    }));
  };

  const rows = useMemo(() => formatRows(tickets), [tickets]);

  const handleOpenTicket = (ticketId) => {
    // Navigates to /tickets/create?id=6&l2=true
    navigate(`/tickets/create?id=${ticketId}&l3=true`);
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Open Ticket (L3)">
          <button
            onClick={() => handleOpenTicket(params.row.id)}
            className="p-1 cursor-pointer bg-[#1c2649] mt-1 text-white rounded hover:bg-slate-700 transition-colors"
          >
            <FilePen size={15} />
          </button>
        </Tooltip>
      ),
    },
    {
      field: "ticketIdDisplay",
      headerName: "Ticket ID",
      width: 160,
      renderCell: (params) => <span className="font-mono text-xs font-semibold text-blue-700">{params.value}</span>,
    },
    {
      field: "hcrmId",
      headerName: "HCRM ID",
      width: 130,
      renderCell: (params) => <span className="text-xs text-gray-600">{params.value}</span>,
    },
    {
      field: "ticketType",
      headerName: "Ticket Type",
      width: 130,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <span className="px-2 py-1 rounded text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">{params.value}</span>
      ),
    },
    {
      field: "stage",
      headerName: "Stage",
      width: 130,
      renderCell: (params) => <span className="text-xs">Stage {params.value}</span>,
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 140,
      renderCell: (params) => <span className="text-xs">User {params.value}</span>,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      renderCell: (params) => <span className="text-xs">{params.value}</span>,
    },
    {
      field: "sla",
      headerName: "SLA",
      width: 100,
      renderCell: (params) => {
        const isOverdue = params.value && new Date(params.value) < new Date();
        return (
          <span className={`text-xs ${isOverdue ? "text-red-600" : "text-green-600"}`}>
            {params.value ? (isOverdue ? "BREACHED" : "ON TRACK") : "NO SLA"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-2 bg-gray-50 min-h-screen ">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Complaint/Escalation</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-1">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            loading={loading}
            autoHeight
            density="compact"
            style={{ fontWeight: "250" }}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeader": { background: "#1c2649 !important", color: "white", fontWeight: "bold" },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintOrEscalation;
