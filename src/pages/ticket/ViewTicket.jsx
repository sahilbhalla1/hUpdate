import { useState, useEffect } from "react";
import { Search, X, CheckCircle, RotateCcw, Eye, Filter, Edit, History, AlertCircle, FileText, FilePen } from "lucide-react";
import { TextField, MenuItem, Chip, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "sonner";
import { PRIMARY_COLOR } from "../../components/Color";
import api from "../../services/api";
import { safeJsonParse } from "../../utils/helpers";
import { formatDateTime, formatRemainingTime } from "../../utils/timeFormat";

const ViewTicket = () => {
  // Agent permissions (normally from API/context)
  const [permissions] = useState({
    canView: true,
    canEdit: true,
    canClose: true,
    canReopen: true,
    canAddRemark: true,
  });
  // const AgentId = Number(isAuth()?.id);
  // State management
  const [tickets, setTickets] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("ticketId");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0); // For pagination

  const fetchTickets = async () => {
    try {
      setLoading(true);

      // We send the filter and search query to your backend getTickets logic
      const payload = {
        filter: searchField,
        search: searchQuery.trim(), // actual search text
        status: statusFilter !== "all" ? statusFilter : "",
        page: paginationModel.page + 1, // DataGrid is 0-indexed, Backend is 1-indexed
        limit: paginationModel.pageSize,
      };

      const res = await api.post("/tickets/filter", payload);

      if (res.data) {
        setTickets(res.data.data); // Mapping 'rows' from service
        setTotalRows(res.data.pagination.total); // Mapping 'total' from service
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when page or page size changes
  useEffect(() => {
    fetchTickets();
  }, [paginationModel.page, paginationModel.pageSize]);

  // Handle Search Button Click
  const handleSearchSubmit = () => {
    // Reset to first page when searching
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } else {
      fetchTickets();
    }
  };

  // Helper to determine what the dynamic header should be
  const getDynamicHeader = () => {
    if (searchField === "name") return "Customer Name";
    if (searchField === "email") return "Customer Email";
    if (searchField === "phone") return "Customer Phone";
    return "Agent Name"; // Default
  };

  const statusColors = {
    OPEN: "bg-gray-100 text-gray-800 border-gray-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    RESOLVED: "bg-green-100 text-green-800 border-green-300",
    CLOSED: "bg-gray-300 text-gray-800 border-gray-300",
    REOPEN: "bg-yellow-300 text-yellow-800 border-yellow-300",
    ESCALATED: "bg-orange-300 text-orange-800 border-orange-300",
  };

  const openTicketModal = async (ticket) => {
    setLoading(true);
    setShowModal(true);
    try {
      const { data } = await api.get(`/tickets/${ticket.id}`);
      setSelectedTicket(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setLoading(false);
    }
  };

  const handleSubmitAction = async (status) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await api.post(`/tickets/agents/${Number(selectedTicket.id)}/action`, {
          status: status,
          remark,
        });

        toast.success("Success");
        closeModal();
        fetchTickets();
        setRemark("");
      } catch (e) {
        console.error(e);
        toast.error(e.response?.data?.message || "Action failed");
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  // Action handlers
  // const handleCloseTicket = async () => {
  //   if (!newRemark.trim()) {
  //     toast.error("Please provide a remark for closing the ticket");
  //     return;
  //   }

  //   setLoading(true);
  //   setTimeout(() => {
  //     console.log("Closing ticket:", selectedTicket.ticketId, "Remark:", newRemark);
  //     toast.success(`Ticket ${selectedTicket.ticketId} has been closed`);
  //     setNewRemark("");
  //     setActionType("");
  //     closeModal();
  //     setLoading(false);
  //   }, 500);
  // };

  // const handleReopenTicket = async () => {
  //   if (!newRemark.trim()) {
  //     toast.error("Please provide a remark for reopening the ticket");
  //     return;
  //   }

  //   setLoading(true);
  //   setTimeout(() => {
  //     console.log("Reopening ticket:", selectedTicket.ticketId, "Remark:", newRemark);
  //     toast.success(`Ticket ${selectedTicket.ticketId} has been reopened`);
  //     setNewRemark("");
  //     setActionType("");
  //     closeModal();
  //     setLoading(false);
  //   }, 500);
  // };

  // const handleAddRemark = async () => {
  //   if (!newRemark.trim()) {
  //     toast.error("Please enter a remark");
  //     return;
  //   }

  //   setLoading(true);
  //   setTimeout(() => {
  //     console.log("Adding remark to ticket:", selectedTicket.ticketId, "Remark:", newRemark);
  //     toast.success("Remark added successfully");
  //     setNewRemark("");
  //     setActionType("");
  //     setLoading(false);
  //   }, 500);
  // };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setRemark("");
  };

  // DataGrid columns
  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Tooltip title="View / Edit Ticket">
            <button
              onClick={() => openTicketModal(params.row)}
              className="p-1.5 cursor-pointer bg-[#1c2649] mt-1 text-white rounded transition-colors"
            >
              <FilePen size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "id",
      headerName: "Ticket ID",
      width: 130,
      renderCell: (params) => <span className="font-mono text-sm font-semibold text-blue-700">{params.value}</span>,
    },
    {
      field: "department_name",
      headerName: "Department Name",
      width: 150,
    },
    {
      field: "dynamicHeaderValue",
      headerName: getDynamicHeader(), // Calls helper to set title
      width: 120,
      renderHeader: () => <span className="font-bold text-white">{getDynamicHeader()}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[params.value]}`}>
          {params.value.replace("_", " ")}
        </span>
      ),
    },
    {
      field: "assigned_resolver_name",
      headerName: "Assigned To",
      width: 140,
      renderCell: (params) => (
        <span className={params.value === "Unassigned" ? "text-gray-400 italic" : "text-gray-700"}>{params.value}</span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      renderCell: (params) => <span className="text-sm">{formatDateTime(params.value)}</span>,
    },
    {
      field: "is_breached",
      headerName: "SLA Status",
      width: 107,
      renderCell: (params) => (
        <span className={`text-xs font-medium ${params.value ? "text-red-600" : "text-green-600"}`}>
          {params.value ? "Breached" : "On Track"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-2 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Ticket Management</h3>
              <p className="text-gray-600 mt-1 text-xs">View, search, and manage customer tickets</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Tickets</div>
              <div className="text-2xl font-bold text-blue-600">{totalRows}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Field Selector - Takes up 2 columns */}
            <div className="md:col-span-2">
              <TextField
                select
                label="Search By"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="ticketId">Ticket ID</MenuItem>
                <MenuItem value="name">Customer Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </TextField>
            </div>

            {/* Status Filter - Takes up 2 columns */}
            <div className="md:col-span-2">
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                {/* <MenuItem value="PENDING">Pending</MenuItem> */}
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="REOPENED">Reopened</MenuItem>
                <MenuItem value="ESCALATED">Escalated</MenuItem>
              </TextField>
            </div>

            {/* Search Input - Takes up the remaining 8 columns */}
            <div className="md:col-span-6">
              <TextField
                label="Search Query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                placeholder="Enter search term..."
                InputProps={{
                  startAdornment: <Search size={18} className="text-gray-400 mr-2" />,
                  endAdornment: searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  ),
                }}
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="bg-[#1c2649] text-white h-10 px-4 rounded hover:bg-[#2a3a6d] transition-colors flex items-center cursor-pointer justify-center min-w-[60px]"
              title="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* DataGrid */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          <DataGrid
            rows={tickets}
            columns={columns}
            rowCount={totalRows}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            loading={loading}
            autoHeight
            density="compact"
            sx={{ "& .MuiDataGrid-columnHeader": { background: "#1c2649 !important", color: "white", fontWeight: "bold" } }}
          />
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Ticket #{selectedTicket.id}</h2>
                  {selectedTicket.is_breached === 1 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold animate-pulse">SLA BREACHED</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${statusColors[selectedTicket.status]}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Level {selectedTicket.current_tat_level}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTicket.is_breached === 1 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {formatRemainingTime(selectedTicket.minutes_remaining)}
                  </span>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400  hover:text-gray-600 cursor-pointer" disabled={loading}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Ticket Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      Ticket Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Journey:</span>
                        <span className="font-medium">{selectedTicket.journey_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{selectedTicket.department_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedTicket.category_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue:</span>
                        <span className="font-medium">{selectedTicket.issue_name}</span>
                      </div>
                      <div className="border-t border-blue-400 pt-1 mt-2">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Ticket Created By</h4>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedTicket.created_by_name}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{selectedTicket.created_by_email}</span>
                        </div>

                        {selectedTicket.created_by_phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedTicket.created_by_phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-blue-400 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Current Level:</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            L{selectedTicket.current_tat_level}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned To:</span>
                          <span className="font-medium">{selectedTicket.assigned_resolver_name || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SLA Hours:</span>
                          <span className="font-medium">{selectedTicket.tat_hours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{formatDateTime(selectedTicket.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due At:</span>
                          <span className={`font-medium ${selectedTicket.is_breached === 1 ? "text-red-600" : "text-green-600"}`}>
                            {new Date(selectedTicket.due_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Fields Grouped by group_name with Scroll */}
                  {selectedTicket.custom_fields && selectedTicket.custom_fields.length > 0 && (
                    <div className="space-y-4 max-h-60 overflow-y-auto  custom-scrollbar">
                      {Object.entries(
                        selectedTicket.custom_fields.reduce((acc, field) => {
                          // Group by group_name, fallback to "General Information"
                          const group = field.group_name || "General Information";
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(field);
                          return acc;
                        }, {}),
                      ).map(([groupName, fields]) => (
                        <div key={groupName} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-1 border-b border-blue-200 pb-1 uppercase text-[11px] tracking-wider">
                            {groupName}
                          </h3>
                          <div className="space-y-3 text-sm">
                            {fields.map((field, idx) => {
                              const displayValue = safeJsonParse(field.answer);
                              const isLongText = typeof displayValue === "string" && displayValue.length > 50;

                              return (
                                <div key={idx} className={isLongText ? "space-y-1" : "flex justify-between gap-4"}>
                                  <span className="text-gray-700 font-medium whitespace-nowrap">{field.label}:</span>
                                  <span
                                    className={`text-gray-900 ${isLongText ? "mt-1 block whitespace-pre-wrap wrap-break-word" : "text-right font-medium"}`}
                                  >
                                    {typeof displayValue === "object" ? JSON.stringify(displayValue, null, 2) : displayValue}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Timeline & Remarks */}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                  <>
                    <h4 className="font-semibold text-gray-900">Take Action</h4>

                    {(selectedTicket.canClose || selectedTicket.canReopen) && (
                      <>
                        {/* Remark — shown once */}
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Remark"
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          size="small"
                          placeholder="Enter remark"
                          sx={{ "& .MuiInputBase-input": { fontSize: "12px" }, mb: 1 }}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {selectedTicket.canClose && (
                            <button
                              onClick={() => handleSubmitAction("CLOSED")}
                              disabled={loading}
                              className="flex-1 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white py-2 rounded text-sm font-medium"
                            >
                              Close Ticket
                            </button>
                          )}

                          {selectedTicket.canReopen && (
                            <button
                              onClick={() => handleSubmitAction("REOPEN")}
                              disabled={loading}
                              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm font-medium"
                            >
                              Re-Open Ticket
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {!selectedTicket.canClose && !selectedTicket.canReopen && (
                      <p className="text-xs text-gray-500">
                        No actions available. The time window has expired or you don’t have permission to close or reopen this ticket.
                      </p>
                    )}
                  </>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Activity Timeline
                      </h4>
                      <div className="space-y-1 max-h-[500px] overflow-y-auto">
                        {selectedTicket.remarks && selectedTicket.remarks.length === 0 ? (
                          <p className="text-gray-500 text-sm">No activity yet</p>
                        ) : (
                          selectedTicket.remarks?.map((r) => (
                            <div key={r.id} className={`rounded-lg p-2 border bg-white border-gray-200`}>
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-sm text-gray-900">{r.created_by_name}</span>
                                <p className="text-xs text-gray-500">{formatDateTime(r.created_at)}</p>
                              </div>
                              <p className="text-sm text-gray-700 mb-1">{r.remark}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;
