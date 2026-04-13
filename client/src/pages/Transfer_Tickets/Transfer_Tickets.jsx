import { useState, useEffect, useMemo } from "react";
import { FilePen } from "lucide-react";
import { Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "sonner";
import { data, useNavigate } from "react-router-dom";
import api from "../../services/api";

const Transfer_Tickets= () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transfer-ticket");
      if (res.data) {
        setTickets(Array.isArray(res.data) ? res.data : res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch consulting tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);


const formatRows = (data) => {
  return data.map((ticket) => {
    console.log("Ticket ID:", ticket.ticketId);

    return {
      ...ticket,
      id: ticket.ticketId,
      ticketIdDisplay: ticket.ticketId,
      ticketType: ticket.orderType,
    
      createdBy: ticket.orderSource,
      createdAt: ticket.createdAt,
    };
  });
};

  const rows = useMemo(() => formatRows(tickets), [tickets]);

  const handleOpenTicket = (ticketId) => {
    navigate(`/tickets/create?id=${ticketId}&tranferticket=true`);
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Open Transfer Ticket">
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
      width: 200,
      renderCell: (params) => (
        <span className="font-mono text-xs font-semibold text-blue-700">
          {params.value}
        </span>
      ),
    },
    {
      field: "ticketType",
      headerName: "Ticket Type",
      width: 220,
    },
    
    {
      field: "createdBy",
      headerName: "Created By",
      width: 250,
      renderCell: (params) => (
        <span className="text-xs">User {params.value}</span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 220,
      renderCell: (params) => (
        <span className="text-xs">{params.value}</span>
      ),
    },
  ];

  return (
    <div className="space-y-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Transfer Ticket</h3>
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
              "& .MuiDataGrid-columnHeader": {
                background: "#1c2649 !important",
                color: "white",
                fontWeight: "bold",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Transfer_Tickets;