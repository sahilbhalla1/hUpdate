import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar, Filter, RefreshCw, FileText, DownloadIcon, Ticket } from "lucide-react";
import { DataGrid, Toolbar, ExportCsv } from "@mui/x-data-grid";
import api from "../../services/api";
import CustomCalendar from "../../components/CustomCalendar";
import { convertUTCToIST } from "../../utils/timeFormat";

function CustomToolbar() {
  return (
    <Toolbar className="flex justify-end">
      <ExportCsv
        render={
          <button
            title="Download as CSV"
            className="rounded-l! bg-[#1c2649] text-white cursor-pointer px-5.5! py-1.5! font-semibold! shadow-md! hover:shadow-lg! hover:bg-[#212a49]! transition-all"
          >
            <span><DownloadIcon size={18} /></span>
          </button>
        }
      />
    </Toolbar>
  );
}

// Defined outside component so it's never recreated
const DEFAULT_STATUS_OPTIONS = [{ id: "", status_description: "All Statuses" }];

const formatIST = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const columns = [
  { field: "ticket_id", headerName: "Ticket ID", width: 100 },
  { field: "external_ticket_number", headerName: "External Ticket No.", width: 160 },
  { field: "customer_name", headerName: "Customer Name", width: 180 },
  { field: "primary_phone", headerName: "Phone", width: 140 },
    { field: "category_name", headerName: "Category Name", width: 220 },
      { field:"sub_category_name", headerName: "SubCategory Name", width: 220 },
      { field:"spec_value", headerName: "Spec Value", width: 220 },
      { field:"model_number", headerName: "Model Number", width: 220 },
      { field:"product_code", headerName: "Product Code", width: 220 },

  { field: "product_id", headerName: "Product ID", width: 110 },
  { field: "serial_no", headerName: "Serial No", width: 160 },
  { field: "serial_no_alt", headerName: "Alt Serial No", width: 160 },
  { field: "purchase_date", headerName: "Purchase Date", width: 160 },
  { field: "purchase_channel", headerName: "Purchase Channel", width: 150 },
  { field: "purchase_partner", headerName: "Purchase Partner", width: 170 },
  { field: "warranty_type_id", headerName: "Warranty Type", width: 130 },
  { field: "order_type_name", headerName: "Order Type", width: 160 },
  { field: "source_name", headerName: "Source", width: 180 },
  { field: "service_type_name", headerName: "Service Type", width: 170 },
  { field: "complaint_type_name", headerName: "Complaint Type", width: 170 },
  { field: "consulting_type_name", headerName: "Consulting Type", width: 170 },
  { field: "symptom_1_name", headerName: "Symptom 1", width: 170 },
  { field: "symptom_2_name", headerName: "Symptom 2", width: 170 },
  { field: "section_name", headerName: "Section", width: 150 },
  { field: "defect_description", headerName: "Defect Description", width: 200 },
  { field: "repair_description", headerName: "Repair Description", width: 220 },
  { field: "condition_flag", headerName: "Condition Flag", width: 130 },
  { field: "status_description", headerName: "Status", width: 130 },
  { field: "stage_label", headerName: "Stage", width: 180 },
  { field: "assign_date", headerName: "Assign Date", width: 160 },
  { field: "expected_closure_date", headerName: "Expected Closure", width: 180 },
  { field: "problem_note", headerName: "Problem Note", width: 250 },
  { field: "agent_remarks", headerName: "Agent Remarks", width: 250 },
  { field: "created_by_email", headerName: "Created By", width: 220 },
  { field: "created_at", headerName: "Created At", width: 170 },
  { field: "consulting_origin", headerName: "Consulting Origin", width: 220 },
];

const Report = () => {
  const today = new Date().toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });
  const [orderTypeId, setOrderTypeId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [orderTypeOptions, setOrderTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Ref to avoid stale closure in status effect
  const orderTypeOptionsRef = useRef(orderTypeOptions);
  useEffect(() => {
    orderTypeOptionsRef.current = orderTypeOptions;
  }, [orderTypeOptions]);

  // Load order types once on mount
  useEffect(() => {
    const fetchOrderTypes = async () => {
      try {
        const otRes = await api.get("/order-type", { withCredentials: true });
        setOrderTypeOptions([
          { id: "", order_type_name: "All Order Types" },
          ...(Array.isArray(otRes.data) ? otRes.data : otRes.data?.data || []),
        ]);
      } catch (err) {
        console.error("Failed to load order types:", err);
      }
    };
    fetchOrderTypes();
  }, []); // ✅ empty deps — runs only once

  // Load statuses when orderTypeId changes — uses ref to avoid re-running on orderTypeOptions change
  useEffect(() => {
    const fetchStatuses = async () => {
      // Batch these two state updates together to avoid double render
      if (!orderTypeId) {
        setStatusId("");
        setStatusOptions(DEFAULT_STATUS_OPTIONS);
        return;
      }

      const selected = orderTypeOptionsRef.current.find(
        (o) => String(o.id) === String(orderTypeId)
      );
      if (!selected?.order_type) return;

      try {
        const stRes = await api.post(
          "/tickets/statuses",
          { orderType: selected.order_type },
          { withCredentials: true }
        );
        // Batch: reset statusId and set new options in one logical update
        setStatusId("");
        setStatusOptions([
          DEFAULT_STATUS_OPTIONS[0],
          ...(stRes.data?.data || stRes.data || []),
        ]);
      } catch (err) {
        console.error("Failed to load statuses:", err);
        setStatusOptions(DEFAULT_STATUS_OPTIONS);
      }
    };

    fetchStatuses();
  }, [orderTypeId]); // ✅ only orderTypeId, not orderTypeOptions

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: dateRange.startDate,
        toDate: dateRange.endDate,
      };
      if (orderTypeId) params.orderTypeId = orderTypeId;
      if (statusId) params.statusId = statusId;

      const response = await api.get("/tickets/report", {
        params,
        withCredentials: true,
      });
      setReportData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, orderTypeId, statusId]);

  // ✅ Memoize rows — only recalculates when reportData actually changes
  const rows = useMemo(() =>
    reportData.map((ticket) => ({
      id: ticket.ticket_id,
      ticket_id: ticket.ticket_id,
      external_ticket_number: ticket.external_ticket_number || "-",
      customer_name: `${ticket.first_name || ""} ${ticket.last_name || ""}`.trim(),
      primary_phone: ticket.primary_phone || "-",
      category_name:ticket.category_name || "-",
      sub_category_name:ticket.sub_category_name || "-",
      spec_value:ticket.spec_value || "-",
      model_number:ticket.model_number || "-",
      product_code : ticket.product_code || "-",
 

      product_id: ticket.product_id || "-",
      serial_no: ticket.serial_no || "-",
      serial_no_alt: ticket.serial_no_alt || "-",
      purchase_date: formatIST(ticket.purchase_date),
      purchase_channel: ticket.purchase_channel || "-",
      purchase_partner: ticket.purchase_partner || "-",
      warranty_type_id:
        ticket.warranty_type_id === "O" ? "Out of Warranty"
        : ticket.warranty_type_id === "I" ? "In Warranty"
        : "-",
      order_type_name: ticket.order_type_name || "-",
      source_name: ticket.source_name || "-",
      service_type_name: ticket.service_type_name || "-",
      complaint_type_name: ticket.complaint_type_name || "-",
      consulting_type_name: ticket.consulting_type_name || "-",
      symptom_1_name: ticket.symptom_1_name || "-",
      symptom_2_name: ticket.symptom_2_name || "-",
      section_name: ticket.section_name || "-",
      defect_description: ticket.defect_description || "-",
      repair_description: ticket.repair_description || "-",
      condition_flag: ticket.condition_flag ?? "-",
      status_description: ticket.status_description || "-",
      stage_label: ticket.stage_label || "-",
      assign_date: formatIST(ticket.assign_date),
      expected_closure_date: formatIST(ticket.expected_closure_date),
      problem_note: ticket.problem_note || "-",
      agent_remarks: ticket.agent_remarks || "-",
      created_by_email: ticket.created_by_email || "-",
      created_at: convertUTCToIST(ticket.created_at),
      consulting_origin:
        ticket.consulting_origin === "SR" ? "Service Request"
        : ticket.consulting_origin === "CO" ? "Complaint"
        : ticket.consulting_origin === "SELF" ? "SELF"
        : "-",
    })),
  [reportData]); // ✅ only re-runs when data changes

  const pageSizeOptions = [10, 20, 30, 50, 100];

  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-2">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
          <h2 className="text-l font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600 text-xs">Generate comprehensive reports for tickets</p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3">
          <div className="space-y-2">

            {/* Single-line filter bar */}
            <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-2xl p-1.5 hover:border-blue-200 transition-all duration-300">

              {/* From Date */}
              <div className="relative flex-1">
                <div
                  className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-blue-50 transition-all duration-300"
                  onClick={() => { setShowStartCalendar(!showStartCalendar); setShowEndCalendar(false); }}
                >
                  <Calendar className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-400 leading-none mb-0.5">FROM</div>
                    <div className="text-xs text-gray-900 font-semibold truncate">
                      {dateRange.startDate
                        ? new Date(dateRange.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Select date"}
                    </div>
                  </div>
                </div>
                {showStartCalendar && (
                  <CustomCalendar
                    selectedDate={dateRange.startDate}
                    onDateSelect={(date) =>
                      setDateRange((prev) => {
                        let newRange = { ...prev, startDate: date };
                        if (newRange.endDate < date) newRange.endDate = date;
                        return newRange;
                      })
                    }
                    onClose={() => setShowStartCalendar(false)}
                    label="Start"
                  />
                )}
              </div>

              {/* Arrow */}
              <div className="shrink-0 w-6 h-6 bg-[#1c2649] rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </div>

              {/* To Date */}
              <div className="relative flex-1">
                <div
                  className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-blue-50 transition-all duration-300"
                  onClick={() => { setShowEndCalendar(!showEndCalendar); setShowStartCalendar(false); }}
                >
                  <Calendar className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-400 leading-none mb-0.5">TO</div>
                    <div className="text-xs text-gray-900 font-semibold truncate">
                      {dateRange.endDate
                        ? new Date(dateRange.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Select date"}
                    </div>
                  </div>
                </div>
                {showEndCalendar && (
                  <CustomCalendar
                    selectedDate={dateRange.endDate}
                    onDateSelect={(date) =>
                      setDateRange((prev) => {
                        if (date < prev.startDate) return prev;
                        return { ...prev, endDate: date };
                      })
                    }
                    onClose={() => setShowEndCalendar(false)}
                    label="End"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-blue-100 shrink-0" />

              {/* Order Type */}
              <div className="flex-1 min-w-0 px-1">
                <div className="text-[10px] text-gray-400 leading-none mb-0.5">ORDER TYPE</div>
                <select
                  value={orderTypeId}
                  onChange={(e) => setOrderTypeId(e.target.value)}
                  className="w-full text-xs text-gray-900 font-semibold bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                >
                  {orderTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.order_type_name}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-blue-100 shrink-0" />

              {/* Status */}
              <div className="flex-1 min-w-0 px-1">
                <div className="text-[10px] text-gray-400 leading-none mb-0.5">STATUS</div>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full text-xs text-gray-900 font-semibold bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.status_description}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-blue-100 shrink-0" />

              {/* Get Report Button */}
              <button
                type="button"
                onClick={fetchReportData}
                disabled={loading}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#1c2649] text-white text-xs rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:bg-[#2a3660] cursor-pointer whitespace-nowrap"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
                {loading ? "Getting..." : "Get Report"}
              </button>
            </div>

            {/* Quick Date Pills */}
            <div className="flex items-center gap-2">
              {[
                { label: "Today", days: 0 },
                { label: "Last 7 days", days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "Last 90 days", days: 90 },
              ].map((range) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - range.days);
                    setDateRange({
                      startDate: startDate.toISOString().split("T")[0],
                      endDate: endDate.toISOString().split("T")[0],
                    });
                  }}
                  className="px-3.5 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-200 border border-blue-200 hover:border-blue-600 cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            <DataGrid
              rows={rows}
              columns={columns}
              style={{ fontWeight: "300" }}
              disableRowSelectionOnClick
              density="compact"
              showToolbar
              pageSizeOptions={pageSizeOptions}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                "& .MuiDataGrid-columnHeader": { background: "#1c2649 !important", color: "white", fontWeight: "bold" },
                "& .MuiDataGrid-columnHeaders": { fontSize: "11px" },
                "& .MuiDataGrid-cell": { fontSize: "11px" },
              }}
              slots={{ toolbar: CustomToolbar }}
            />
          </div>
        )}

        {/* Click outside to close calendars */}
        {(showStartCalendar || showEndCalendar) && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowStartCalendar(false); setShowEndCalendar(false); }} />
        )}

        {reportData.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-l font-semibold text-gray-900 mb-1">No Data Available</h4>
            <p className="text-gray-600 text-xs mb-1">Select your date range, then click "Get Report" to view data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;