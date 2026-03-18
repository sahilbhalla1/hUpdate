import { useState, useEffect, useMemo } from "react";
import { FilePen } from "lucide-react";
import { Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { convertUTCToIST } from "../../utils/timeFormat";

const FILTER_OPTIONS = [
  { label: "DOA", value: "DOA" },
  { label: "Exchange", value: "EXCHANGE" },
  { label: "All", value: "All" },
];

const TechValidationList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/internal-validation-tickets");
      if (res.data) {
        setTickets(Array.isArray(res.data) ? res.data : res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tech validation tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatRows = (data) => {
    return data.map((ticket) => ({
      ...ticket,
      id: ticket.ticket_id,
      ticketIdDisplay: ticket.ticket_id,
      hcrmId: ticket.hcrm_id || "N/A",
      ticketType: ticket.ticket_type,
      status: ticket.status,
      stage: ticket.stage,
      createdBy: ticket.created_by,
      createdAt: convertUTCToIST(ticket.created_at),
      validationType: ticket.type, // DOA | Exchange
    }));
  };

  const allRows = useMemo(() => formatRows(tickets), [tickets]);

  const rows = useMemo(() => {
    if (activeFilter === "All") return allRows;
    return allRows.filter((r) => r.validationType === activeFilter);
  }, [allRows, activeFilter]);

  const handleOpenTicket = (ticketId) => {
    navigate(`/tech-validation-ext?id=${ticketId}&techValidation=true`);
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Open Ticket">
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
      width: 100,
      renderCell: (params) => <span className="font-mono text-xs font-semibold text-blue-700">{params.value}</span>,
    },
    {
      field: "hcrmId",
      headerName: "HCRM ID",
      width: 130,
      renderCell: (params) => <span className="text-xs text-gray-600">{params.value}</span>,
    },
    {
      field: "validationType",
      headerName: "Type",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold border ${
            params.value === "DOA" ? "bg-red-50 text-red-700 border-red-200" : "bg-purple-50 text-purple-700 border-purple-200"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "ticketType",
      headerName: "Ticket Type",
      width: 130,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <span className="px-2 py-1 rounded text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">{params.value}</span>
      ),
    },
    {
      field: "stage",
      headerName: "Stage",
      width: 120,
      renderCell: (params) => <span className="text-xs">{params.value}</span>,
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 120,
      renderCell: (params) => <span className="text-xs">{params.value}</span>,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      renderCell: (params) => <span className="text-xs">{params.value}</span>,
    },
  ];

  return (
    <div className="space-y-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1 flex justify-between items-center">
          <h3 className="text-l font-bold text-gray-900">Tech Validation List</h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`px-3 py-1 cursor-pointer rounded text-xs font-semibold transition-colors ${
                  activeFilter === opt.value ? "bg-[#1c2649] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* DataGrid */}
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
              "& .MuiDataGrid-columnHeader": {
                background: "#1c2649 !important",
                color: "white",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-columnHeaders": {
                fontSize: "11px",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "11px",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TechValidationList;
