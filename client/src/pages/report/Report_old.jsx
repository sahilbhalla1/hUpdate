import { useState } from "react";
import { Calendar, Filter, RefreshCw, FileText, DownloadIcon } from "lucide-react";
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
            variant="contained"
            color="primary"
            title="Download as CSV"
            className="rounded-l! bg-[#1c2649] text-white cursor-pointer px-5.5! py-1.5! font-semibold! shadow-md! hover:shadow-lg! hover:bg-[#212a49]! transition-all"
          >
            <span>
              <DownloadIcon size={18} />
            </span>
          </button>
        }
      />
    </Toolbar>
  );
}
const Report = () => {
  const today = new Date().toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Mock API call
  const fetchReportData = async () => {
    setLoading(true);

    try {
      const response = await api.get("/tickets/report", {
        params: {
          fromDate: dateRange.startDate,
          toDate: dateRange.endDate,
        },
        withCredentials: true,
      });

      setReportData(response.data?.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const columns = [
    { field: "ticket_id", headerName: "Ticket ID", width: 100 },
    { field: "external_ticket_number", headerName: "External Ticket No.", width: 160 },
    { field: "customer_name", headerName: "Customer Name", width: 180 },
    { field: "primary_phone", headerName: "Phone", width: 140 },
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

  const rows = reportData?.map((ticket) => {
    const formatIST = (date) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      id: ticket.ticket_id,

      ticket_id: ticket.ticket_id,
      external_ticket_number: ticket.external_ticket_number || "-",
      customer_name: `${ticket.first_name || ""} ${ticket.last_name || ""}`.trim(),
      primary_phone: ticket.primary_phone || "-",
      product_id: ticket.product_id || "-",
      serial_no: ticket.serial_no || "-",
      serial_no_alt: ticket.serial_no_alt || "-",
      purchase_date: formatIST(ticket.purchase_date),
      purchase_channel: ticket.purchase_channel || "-",
      purchase_partner: ticket.purchase_partner || "-",
      warranty_type_id: ticket.warranty_type_id === "O" ? "Out of Warranty" : ticket.warranty_type_id === "I" ? "In Warranty" : "-",
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
  ticket.consulting_origin === "SR"
    ? "Service Request"
    : ticket.consulting_origin === "CO"
    ? "Complaint"
    : ticket.consulting_origin === "SELF"
    ? "SELF"
    : "-",
    };
  });

  const pageSizeOptions = [10, 20, 30, 50, 100];

  return (
    <div className=" bg-linear-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-l font-bold text-gray-900">Reports</h2>
              <p className="text-gray-600 text-xs">Generate comprehensive reports for tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3">
          {/* Filters Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range Picker */}
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="flex items-center bg-linear-to-r border border-blue-100 rounded-2xl p-1 hover:border-blue-200 transition-all duration-300">
                    {/* Start Date */}
                    <div className="flex-1 relative">
                      <div
                        className="flex text-sm items-center bg-white rounded-xl px-3 py-1 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setShowStartCalendar(!showStartCalendar);
                          setShowEndCalendar(false);
                        }}
                      >
                        <Calendar className="h-4.5 w-4.5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-.5">FROM</div>
                          <div className="text-gray-900 font-semibold">
                            {dateRange.startDate
                              ? new Date(dateRange.startDate + "T00:00:00").toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
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
                              // if endDate < new startDate → adjust endDate
                              if (newRange.endDate < date) {
                                newRange.endDate = date;
                              }
                              return newRange;
                            })
                          }
                          onClose={() => setShowStartCalendar(false)}
                          label="Start"
                        />
                      )}
                    </div>

                    {/* Arrow Separator */}
                    <div className="px-4 flex items-center justify-center">
                      <div className="w-7 h-7 bg-[#1c2649] rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                        </svg>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="flex-1 relative">
                      <div
                        className="flex text-sm items-center bg-white rounded-xl px-3 py-1 mr-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setShowEndCalendar(!showEndCalendar);
                          setShowStartCalendar(false);
                        }}
                      >
                        <Calendar className="h-4.5 w-4.5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-.5">TO</div>
                          <div className="text-gray-900 font-semibold">
                            {dateRange.endDate
                              ? new Date(dateRange.endDate + "T00:00:00").toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Select date"}
                          </div>
                        </div>
                      </div>
                      {showEndCalendar && (
                        <CustomCalendar
                          selectedDate={dateRange.endDate}
                          onDateSelect={(date) =>
                            setDateRange((prev) => {
                              // only allow endDate >= startDate
                              if (date < prev.startDate) {
                                return prev; // ignore invalid
                              }
                              return { ...prev, endDate: date };
                            })
                          }
                          onClose={() => setShowEndCalendar(false)}
                          label="End"
                        />
                      )}
                    </div>
                    {/* Submit Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center text-sm justify-center gap-1 px-4 py-1.5 bg-[#1c2649] text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Filter className="h-5 w-5" />}
                        {loading ? "Getting..." : "Get Report"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Date Range Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
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
                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 hover:border-blue-300 cursor-pointer"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Summary */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            {/* Data Grid */}
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
                // fontSize: "10px", // whole grid text smaller
                "& .MuiDataGrid-columnHeaders": {
                  fontSize: "11px",
                },
                "& .MuiDataGrid-cell": {
                  fontSize: "11px",
                },
              }}
              slots={{ toolbar: CustomToolbar }}
            />
          </div>
        )}

        {/* Click outside to close calendars */}
        {(showStartCalendar || showEndCalendar) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowStartCalendar(false);
              setShowEndCalendar(false);
            }}
          />
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
