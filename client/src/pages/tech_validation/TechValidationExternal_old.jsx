import { useEffect, useState, useRef } from "react";
import { CircularProgress } from "@mui/material";
import {
  User,
  Package,
  Wrench,
  Save,
  Search,
  Paperclip,
  Upload,
  ChevronDown,
  FileImage,
  FileVideo,
  File,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import FormField from "../ticket/FormField";
import CategorySelectField from "../ticket/CategorySelectField";
import { sanitizeSapText } from "../../utils/SanitizeInput";

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-blue-100">
    <div className="p-1.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
      <Icon size={16} className="text-white" />
    </div>
    <h4 className="font-bold text-gray-800 uppercase text-xs tracking-wide">{title}</h4>
  </div>
);

// ─── Attachment Config ──────────────────────────────────────────────────────────
const ALL_ATTACHMENTS = [
  {
    sno: 1,
    label: "Product Serial Number",
    attachmentKey: "PRODUCT_SERIAL_NUMBER",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: true,
  },
  {
    sno: 2,
    label: "Product Invoice",
    attachmentKey: "PRODUCT_INVOICE",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: true,
  },
  {
    sno: 3,
    label: "Fault Video",
    attachmentKey: "FAULT_VIDEO",
    type: "Video",
    icon: FileVideo,
    accept: ".mp4,.mov,.avi,.mkv,.webm,.wmv",
    formatDisplay: "MP4, MOV, AVI, MKV, WebM, WMV",
    maxSize: 10 * 1024 * 1024,
    sizeDisplay: "< 10MB",
    exchangeOnly: true,
  },
  {
    sno: 4,
    label: "Others",
    attachmentKey: "OTHERS",
    type: "All Type",
    icon: File,
    accept: "*",
    formatDisplay: "All formats",
    maxSize: 10 * 1024 * 1024,
    sizeDisplay: "< 10MB",
    exchangeOnly: true,
  },
  {
    sno: 5,
    label: "Box Image 1",
    attachmentKey: "BOX_IMAGE_1",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
  {
    sno: 6,
    label: "Box Image 2",
    attachmentKey: "BOX_IMAGE_2",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
  {
    sno: 7,
    label: "Box Image 3",
    attachmentKey: "BOX_IMAGE_3",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
  {
    sno: 8,
    label: "Box Image 4",
    attachmentKey: "BOX_IMAGE_4",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
  {
    sno: 9,
    label: "Box Image 5",
    attachmentKey: "BOX_IMAGE_5",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
  {
    sno: 10,
    label: "Box Image 6",
    attachmentKey: "BOX_IMAGE_6",
    type: "Image",
    icon: FileImage,
    accept: ".jpg,.jpeg,.gif,.png,.tiff,.tif,.bmp,.pdf",
    formatDisplay: "JPEG, GIF, PNG, TIFF, BMP, PDF",
    maxSize: 2 * 1024 * 1024,
    sizeDisplay: "< 2MB",
    exchangeOnly: false,
  },
];

// ─── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
    Approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
    Rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400" },
  };
  const s = map[status] || map.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || "Pending"}
    </span>
  );
};

// ─── Attachment Row ─────────────────────────────────────────────────────────────
const AttachmentRow = ({ attachment, file, status, onUpload, disabled }) => {
  const inputRef = useRef(null);
  const Icon = attachment.icon;

  return (
    <tr className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
      {/* S.No */}
      <td className="px-3 py-2 text-center">
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold inline-flex items-center justify-center">
          {attachment.sno}
        </span>
      </td>
      {/* Attachment Type */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className="text-blue-400 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-700">{attachment.label}</span>
        </div>
        {file && (
          <div className="mt-0.5 text-[10px] text-gray-400 truncate max-w-[140px]" title={file.name}>
            {file.name}
          </div>
        )}
      </td>
      {/* Type */}
      <td className="px-3 py-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{attachment.type}</span>
      </td>
      {/* Format */}
      <td className="px-3 py-2">
        <span className="text-[10px] text-gray-500 leading-relaxed">{attachment.formatDisplay}</span>
      </td>
      {/* Size */}
      <td className="px-3 py-1.5">
        <span className="text-[10px] font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
          {attachment.sizeDisplay}
        </span>
      </td>
      {/* Upload */}
      <td className="px-3 py-2">
        <input
          ref={inputRef}
          type="file"
          accept={attachment.accept === "*" ? undefined : attachment.accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > attachment.maxSize) {
              toast.error(`${attachment.label}: File too large. Max ${attachment.sizeDisplay}`);
              e.target.value = "";
              return;
            }
            onUpload(attachment.sno, f);
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md active:scale-95"}`}
        >
          <Upload size={10} />
          {file ? "Replace" : "Upload"}
        </button>
      </td>
      {/* Status */}
      <td className="px-3 py-2">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
};

// ─── Preview Modal ──────────────────────────────────────────────────────────────
const PreviewModal = ({ item, onClose }) => {
  if (!item) return null;
  const isImage = item.mime_type?.startsWith("image/");
  const isVideo = item.mime_type?.startsWith("video/");
  const isPdf = item.mime_type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <File size={15} className="text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-gray-700 truncate">{item.file_name}</span>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            <a
              href={item.url}
              download={item.file_name}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors"
            >
              <Download size={11} /> Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4 min-h-[300px]">
          {isImage && <img src={item.url} alt={item.file_name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow" />}
          {isVideo && (
            <video controls className="max-w-full max-h-[70vh] rounded-lg shadow">
              <source src={item.url} type={item.mime_type} />
              Your browser does not support the video tag.
            </video>
          )}
          {isPdf && <iframe src={item.url} title={item.file_name} className="w-full h-[70vh] rounded-lg border border-gray-200" />}
          {!isImage && !isVideo && !isPdf && (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <File size={48} />
              <p className="text-sm font-medium">Preview not available for this file type</p>
              <a
                href={item.url}
                download={item.file_name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
              >
                <Download size={13} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tech Validation Attachment Row ────────────────────────────────────────────
const TechValidationAttachmentRow = ({ attachment, decision, onDecisionChange, onPreview, sno }) => {
  const isImage = attachment.mime_type?.startsWith("image/");
  const isVideo = attachment.mime_type?.startsWith("video/");
  const isPdf = attachment.mime_type === "application/pdf";

  const FileIcon = isImage ? FileImage : isVideo ? FileVideo : File;

  const formatBytes = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const decisionVal = decision?.decision || "PENDING";
  const remark = decision?.remark || "";

  return (
    <tr
      className={`border-b border-gray-50 transition-colors group ${
        decisionVal === "APPROVED" ? "bg-emerald-50/40" : decisionVal === "REJECTED" ? "bg-red-50/40" : "hover:bg-blue-50/30"
      }`}
    >
      {/* S.No */}
      <td className="px-3 py-2 text-center">
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold inline-flex items-center justify-center">
          {sno}
        </span>
      </td>
      {/* Type */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <FileIcon size={13} className="text-blue-400 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-gray-700">{attachment.attachment_type?.replace(/_/g, " ")}</div>
            <div className="text-[10px] text-gray-400 truncate max-w-[150px]" title={attachment.file_name}>
              {attachment.file_name}
            </div>
          </div>
        </div>
      </td>
      {/* Size */}
      <td className="px-3 py-2">
        <span className="text-[10px] text-gray-500 font-medium">{formatBytes(attachment.file_size)}</span>
      </td>
      {/* Uploaded By */}
      <td className="px-3 py-2">
        <span className="text-[10px] text-gray-600">{attachment.uploaded_by || "-"}</span>
      </td>
      {/* Preview / Download */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPreview(attachment)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Eye size={10} /> Preview
          </button>
          {/* <a
            href={attachment.file_path}
            download={attachment.file_name}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold transition-colors shadow-sm"
          >
            <Download size={10} />
          </a> */}
        </div>
      </td>
      {/* Decision Buttons */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDecisionChange(attachment.attachment_id, "APPROVED")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
              decisionVal === "APPROVED"
                ? "bg-emerald-500 text-white border-emerald-500 shadow"
                : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle size={11} /> Approve
          </button>
          <button
            type="button"
            onClick={() => onDecisionChange(attachment.attachment_id, "DECLINED")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
              decisionVal === "DECLINED"
                ? "bg-red-500 text-white border-red-500 shadow"
                : "bg-white text-red-500 border-red-300 hover:bg-red-50"
            }`}
          >
            <XCircle size={11} /> Decline
          </button>
        </div>
      </td>
      {/* Status Badge */}
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
            decisionVal === "APPROVED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : decisionVal === "DECLINED"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              decisionVal === "APPROVED" ? "bg-emerald-400" : decisionVal === "DECLINED" ? "bg-red-400" : "bg-amber-400"
            }`}
          />
          {decisionVal === "APPROVED" ? "Approved" : decisionVal === "DECLINED" ? "Declined" : "Pending"}
        </span>
      </td>
      {/* Remark */}
      <td className="px-3 py-2 min-w-40">
        <input
          type="text"
          value={remark}
          onChange={(e) => onDecisionChange(attachment.attachment_id, decisionVal, e.target.value)}
          placeholder={decisionVal === "DECLINED" ? "Rejection reason..." : "Optional remark"}
          className={`w-full text-[10px] px-2 py-1 rounded-lg border outline-none focus:ring-1 transition-all ${
            decisionVal === "DECLINED"
              ? "border-red-300 focus:ring-red-300 bg-red-50 placeholder-red-300"
              : "border-gray-200 focus:ring-blue-300 bg-gray-50"
          }`}
        />
      </td>
    </tr>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TechValidation() {
  const INITIAL_VALUES = {
    END_COUNTRY: "India(IN)",
    END_USER_TYPE: "",
    ASSIGN_DATE: new Date().toISOString().split("T")[0],
    STATUS: "",
    STATUS_CODE: "",
    STATUS_ID: "",
    STAGE: "",
    STAGE_CODE: "",
    STAGE_ID: "",
    // customer
    CUSTOMER_ID: "",
    TITLE: "",
    END_FIRST_NAME: "",
    END_LAST_NAME: "",
    END_COMP_NAME: "",
    END_TELEPHONE: "",
    END_CELL_PHONE: "",
    END_EMAIL: "",
    END_ZIP_CODE: "",
    END_CITY: "",
    END_PROVINCE: "",
    END_ADDRESS1: "",
    END_ADDRESS2: "",
    END_ADDRESS3: "",
    END_Socials: {},
    // product
    customerProductId: "",
    PRODUCT_ID: "",
    PRODUCT_ID_HISENSE: "",
    Category: "",
    Category_Code: "",
    CATEGORY_ID: "",
    SUB_CATEGORY_ID: "",
    MODEL_SPEC_ID: "",
    CUSTOMER_MODEL_ID: "",
    SERIALNO: "",
    SERIALNO1: "",
    PURCHASE_DATE: "",
    PURCHASE_CHANNEL: "",
    PURCHASE_Partner: "",
    WARRANTYPE: "",
    WARRANTYPEID: "",
    VOID_WARRANTY: false,
    // agent / ticket
    SERVICE_TYPE: "",
    SERVICE_TYPE_ID: "",
    SERVICE_TYPE_CODE: "",
    ORDER_SOURCE: "",
    ORDER_SOURCE_CODE: "",
    ORDER_SOURCE_ID: "",
    ORDER_TYPE: "",
    ORDER_TYPE_CODE: "",
    ORDER_TYPE_ID: "",
    COMPLAINT_TYPE: "",
    COMPLAINT_TYPE_CODE: "",
    COMPLAINT_TYPE_ID: "",
    CONDITION_CODE: "",
    CONSULTING_TYPE: "",
    CONSULTING_TYPE_ID: "",
    CONSULTING_TYPE_CODE: "",
    IS_CONSULTING: false,
    ticketNumber: "",
    problem_note: "",
    technician_remarks: "",
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // ── Ticket type ──────────────────────────────────────────────────────────────
  const [ticketType, setTicketType] = useState(""); // "DOA" | "Exchange"
  const [internalTicketType, setInternalTicketType] = useState(""); // "DOA" | "Exchange"

  // ── HCRM ────────────────────────────────────────────────────────────────────
  const [hcrmSearchQuery, setHcrmSearchQuery] = useState("");
  const [hcrmSearchLoading, setHcrmSearchLoading] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [values, setValues] = useState(INITIAL_VALUES);
  const [pincodeData, setPincodeData] = useState({ pincode: "", city: "", state: "", provinceCode: "", sla: "" });
  const [showSocials, setShowSocials] = useState(false);

  // ── Product dropdowns ────────────────────────────────────────────────────────
  const [customerProducts, setCustomerProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [modelSpecifications, setModelSpecifications] = useState([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [customerModels, setCustomerModels] = useState([]);
  const [customerModelLoading, setCustomerModelLoading] = useState(false);
  const [selectedCustomerProduct, setSelectedCustomerProduct] = useState(null);
  const [productIds, setProductIds] = useState([]);
  const [productIdsLoading, setProductIdsLoading] = useState(false);
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [isWarrantyLocked, setIsWarrantyLocked] = useState(false);

  // ── Agent inputs ─────────────────────────────────────────────────────────────
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [orderSources, setOrderSources] = useState([]);
  const [orderSourceLoading, setOrderSourceLoading] = useState(false);
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderTypeLoading, setOrderTypeLoading] = useState(false);
  const [symptomsL1, setSymptomsL1] = useState([]);
  const [symptomsLoading, setSymptomsLoading] = useState(false);
  const [symptomsL2, setSymptomsL2] = useState([]);
  const [symptomsL2Loading, setSymptomsL2Loading] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [defects, setDefects] = useState([]);
  const [defectsLoading, setDefectsLoading] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [repairsLoading, setRepairsLoading] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [consultingTypes, setConsultingTypes] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);

  // ── Ticket & history ─────────────────────────────────────────────────────────
  // const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);
  const [isTicketReadOnly, setIsTicketReadOnly] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const [activeBottomTab, setActiveBottomTab] = useState("attachments"); // "attachments"

  // ── Attachments ──────────────────────────────────────────────────────────────
  const [attachmentFiles, setAttachmentFiles] = useState({}); // sno -> File
  const [attachmentStatuses, setAttachmentStatuses] = useState({}); // sno -> "Pending"|"Approved"|"Rejected"

  const urlTicketId = searchParams.get("id");
  const isTechValidation = searchParams.get("techValidation") === "true";

  // ── Tech Validation: fetched attachments from API ─────────────────────────────
  const [fetchedAttachments, setFetchedAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  // { [attachment_id]: { decision: "APPROVED"|"REJECTED", remark: "" } }
  const [attachmentDecisions, setAttachmentDecisions] = useState({});
  // Preview modal
  const [previewItem, setPreviewItem] = useState(null); // { url, mime_type, file_name }

  // ── Visible attachments based on ticket type ──────────────────────────────────
  const visibleAttachments =
    ticketType === "Exchange" ? ALL_ATTACHMENTS.filter((a) => a.exchangeOnly) : ticketType === "DOA" ? ALL_ATTACHMENTS : [];

  // ─────────────────────────────────────────────────────────────────────────────
  // API Fetches on mount
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/master/categories");
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        // setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchOrderSources = async () => {
      try {
        setOrderSourceLoading(true);
        const res = await api.get("/order-source");
        if (res.data.success) setOrderSources(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setOrderSourceLoading(false);
      }
    };
    fetchOrderSources();
  }, []);

  useEffect(() => {
    const fetchOrderTypes = async () => {
      try {
        setOrderTypeLoading(true);
        const res = await api.get("/order-type");
        if (res.data.success) setOrderTypes(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setOrderTypeLoading(false);
      }
    };
    fetchOrderTypes();
  }, []);

  useEffect(() => {
    const fetchConsultingTypes = async () => {
      try {
        const res = await api.get("/masters-orders/consulting-types");
        if (res.data.success) setConsultingTypes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConsultingTypes();
  }, []);

  useEffect(() => {
    const fetchComplaintTypes = async () => {
      try {
        const res = await api.get("/masters-orders/complaint-types");
        if (res.data.success) setComplaintTypes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComplaintTypes();
  }, []);

  // Sub-category / model cascade — fetch lists always, auto-select from selectedCustomerProduct when available
  useEffect(() => {
    if (!values.CATEGORY_ID) {
      setSubCategories([]);
      return;
    }
    const fetch = async () => {
      try {
        setSubCategoriesLoading(true);
        const res = await api.get(`/master/sub-categories/${values.CATEGORY_ID}`);
        if (res.data.success) {
          setSubCategories(res.data.data);
          if (selectedCustomerProduct?.subCategoryId) {
            setValues((prev) => ({ ...prev, SUB_CATEGORY_ID: selectedCustomerProduct.subCategoryId }));
          }
        }
      } catch (err) {
        setSubCategories([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    };
    fetch();
  }, [values.CATEGORY_ID, selectedCustomerProduct]);

  useEffect(() => {
    if (!values.SUB_CATEGORY_ID) {
      setModelSpecifications([]);
      return;
    }
    const fetch = async () => {
      try {
        setModelLoading(true);
        const res = await api.get(`/master/model-specifications/${values.SUB_CATEGORY_ID}`);
        if (res.data.success) {
          setModelSpecifications(res.data.data);
          if (selectedCustomerProduct?.modelSpecificationId) {
            setValues((prev) => ({ ...prev, MODEL_SPEC_ID: selectedCustomerProduct.modelSpecificationId }));
          }
        }
      } catch (err) {
        setModelSpecifications([]);
      } finally {
        setModelLoading(false);
      }
    };
    fetch();
  }, [values.SUB_CATEGORY_ID, selectedCustomerProduct]);

  useEffect(() => {
    if (!values.MODEL_SPEC_ID) {
      setCustomerModels([]);
      setProductIds([]);
      return;
    }
    const fetch = async () => {
      try {
        setCustomerModelLoading(true);
        const res = await api.get(`/master/customer-models/${values.MODEL_SPEC_ID}`);
        if (res.data.success) {
          setCustomerModels(res.data.data);
          if (selectedCustomerProduct?.customerModelId) {
            setValues((prev) => ({ ...prev, CUSTOMER_MODEL_ID: selectedCustomerProduct.customerModelId }));
          }
        }
      } catch (err) {
        setCustomerModels([]);
      } finally {
        setCustomerModelLoading(false);
      }
    };
    fetch();
  }, [values.MODEL_SPEC_ID, selectedCustomerProduct]);

  useEffect(() => {
    const fetch = async () => {
      if (!values.CUSTOMER_MODEL_ID) {
        setProductIds([]);
        return;
      }
      try {
        setProductIdsLoading(true);
        const res = await api.get(`/master/product-ids/${values.CUSTOMER_MODEL_ID}`);
        if (res.data.success) setProductIds(res.data.data);
        else setProductIds([]);
      } catch (err) {
        setProductIds([]);
      } finally {
        setProductIdsLoading(false);
      }
    };
    fetch();
  }, [values.CUSTOMER_MODEL_ID]);

  // ── Auto-fill product fields when Category + customerProducts are both set
  useEffect(() => {
    if (!values.Category || customerProducts.length === 0) return;
    const selectedProduct = customerProducts.find((p) => p.category === values.Category);
    if (!selectedProduct) return;
    setValues((prev) => ({
      ...prev,
      PRODUCT_ID: selectedProduct.productId,
      PRODUCT_ID_HISENSE: selectedProduct.productCode,
      customerProductId: selectedProduct.customerProductId,
      SUB_CATEGORY: selectedProduct.subCategory,
      MODEL_SPECIFICATION: selectedProduct.modelSpecification,
      CUSTOMER_MODEL: selectedProduct.customerModelNumber,
      SERIALNO: selectedProduct.serialNo,
      SERIALNO1: selectedProduct.serialNoAlt || "",
      PURCHASE_DATE: selectedProduct.purchaseDate?.split("T")[0] || "",
      PURCHASE_CHANNEL: selectedProduct.purchaseChannel
        ? selectedProduct.purchaseChannel.toLowerCase() === "online"
          ? "Online"
          : "Offline"
        : "",
      PURCHASE_Partner: selectedProduct.purchasePartner || "",
    }));
  }, [values.Category, customerProducts]);

  // Symptoms cascade
  useEffect(() => {
    const fetch = async () => {
      if (!values.CATEGORY_ID || !values.ORDER_TYPE_CODE) {
        setSymptomsL1([]);
        return;
      }
      try {
        setSymptomsLoading(true);
        const res = await api.get(`/symptom-level1?categoryId=${values.CATEGORY_ID}`);
        if (res.data.success) setSymptomsL1(res.data.data);
      } catch (err) {
        setSymptomsL1([]);
      } finally {
        setSymptomsLoading(false);
      }
    };
    fetch();
  }, [values.CATEGORY_ID, values.ORDER_TYPE_CODE]);

  useEffect(() => {
    const fetch = async () => {
      if (!values.SYMPTOM_1_ID) {
        setSymptomsL2([]);
        return;
      }
      try {
        setSymptomsL2Loading(true);
        const res = await api.get(`/symptom-level2?symptom1Id=${values.SYMPTOM_1_ID}`);
        if (res.data.success) setSymptomsL2(res.data.data);
      } catch (err) {
        setSymptomsL2([]);
      } finally {
        setSymptomsL2Loading(false);
      }
    };
    fetch();
  }, [values.SYMPTOM_1_ID]);

  useEffect(() => {
    const fetch = async () => {
      if (!values.SYMPTOM_2_ID) {
        setSections([]);
        return;
      }
      try {
        setSectionsLoading(true);
        const res = await api.get(`/section?symptomL2Id=${values.SYMPTOM_2_ID}`);
        if (res.data.success) setSections(res.data.data);
      } catch (err) {
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    fetch();
  }, [values.SYMPTOM_2_ID]);

  useEffect(() => {
    const fetch = async () => {
      if (!values.SECTION_ID) {
        setDefects([]);
        return;
      }
      try {
        setDefectsLoading(true);
        const res = await api.get(`/defect?sectionId=${values.SECTION_ID}`);
        if (res.data.success) setDefects(res.data.data);
      } catch (err) {
        setDefects([]);
      } finally {
        setDefectsLoading(false);
      }
    };
    fetch();
  }, [values.SECTION_ID]);

  useEffect(() => {
    const fetch = async () => {
      if (!values.DEFECT_ID) {
        setRepairs([]);
        return;
      }
      try {
        setRepairsLoading(true);
        const res = await api.get(`/repair-action?defectId=${values.DEFECT_ID}`);
        if (res.data.success) setRepairs(res.data.data);
      } catch (err) {
        setRepairs([]);
      } finally {
        setRepairsLoading(false);
      }
    };
    fetch();
  }, [values.DEFECT_ID]);

  // Service types
  useEffect(() => {
    const fetch = async () => {
      if (!values.ORDER_TYPE_CODE) {
        setServiceTypes([]);
        return;
      }
      try {
        setServiceTypesLoading(true);
        const res = await api.get(`/service-type`);
        if (res.data.success) setServiceTypes(res.data.data);
      } catch (err) {
        setServiceTypes([]);
      } finally {
        setServiceTypesLoading(false);
      }
    };
    fetch();
  }, [values.ORDER_TYPE_CODE]);

  // Statuses
  useEffect(() => {
    const fetch = async () => {
      if (!values.ORDER_TYPE_CODE) {
        setAvailableStatuses([]);
        return;
      }
      try {
        setStatusesLoading(true);
        const res = await api.post("/tickets/statuses", { orderType: values.ORDER_TYPE_CODE });
        if (res.data.success) {
          let statuses = res.data.data;
          if (values.ORDER_TYPE_CODE === "ZSV1") statuses = statuses.filter((s) => s.status_code === "E0002");
          setAvailableStatuses(statuses);
        }
      } catch (err) {
        setAvailableStatuses([]);
      } finally {
        setStatusesLoading(false);
      }
    };
    fetch();
  }, [values.ORDER_TYPE_CODE]);

  // Stages
  useEffect(() => {
    const fetch = async () => {
      if (values.ORDER_TYPE_CODE !== "ZSV1" || !values.STATUS_CODE) return;
      try {
        setStagesLoading(true);
        const res = await api.post("/tickets/stage", { statusCode: values.STATUS_CODE });
        if (res.data.success && res.data.data) {
          const stage = res.data.data;
          setValues((prev) => ({ ...prev, STAGE: stage.stage_label, STAGE_CODE: stage.stage_code, STAGE_ID: stage.id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStagesLoading(false);
      }
    };
    fetch();
  }, [values.STATUS_CODE, values.ORDER_TYPE_CODE]);

  // Auto-load from URL
  useEffect(() => {
    if (!urlTicketId) return;
    const load = async () => {
      try {
        setTicketDetailsLoading(true);
        const res = await api.get(`/tickets/${urlTicketId}/details`);
        if (res.data.success) {
          bindTicketData(res.data.data, { successMessage: null, ticketId: Number(urlTicketId) });
        }
      } catch (err) {
        toast.error("Failed to load ticket details");
      } finally {
        setTicketDetailsLoading(false);
      }
    };
    load();
  }, [urlTicketId]);

  // Fetch attachments for tech validation mode
  useEffect(() => {
    if (!isTechValidation || !urlTicketId) return;
    const fetchAttachments = async () => {
      try {
        setAttachmentsLoading(true);
        const res = await api.get(`/tickets/${urlTicketId}/attachments`);
        if (res.data.success) {
          setFetchedAttachments(res.data.data || []);
          // Init decisions as PENDING
          const init = {};
          (res.data.data || []).forEach((a) => {
            init[a.attachment_id] = { decision: a.validation_status || "PENDING", remark: a.validation_remark || "" };
          });
          setAttachmentDecisions(init);
        }
      } catch (err) {
        toast.error("Failed to load attachments");
      } finally {
        setAttachmentsLoading(false);
      }
    };
    fetchAttachments();
  }, [isTechValidation, urlTicketId]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HCRM Search
  // ─────────────────────────────────────────────────────────────────────────────
  const handleHcrmSearch = async () => {
    if (!ticketType) {
      toast.error("Please select a Ticket Type first");
      return;
    }
    if (!hcrmSearchQuery.trim()) {
      toast.error("Please enter an HCRM ID to search");
      return;
    }
    try {
      setHcrmSearchLoading(true);
      const res = await api.get(`/tickets/${hcrmSearchQuery}/application-validation?applicationType=${ticketType}`);
      if (res.data.success) {
        bindTicketData(res.data.data, { successMessage: `HCRM ticket ${hcrmSearchQuery} loaded successfully` });
      } else {
        toast.error("No data found for this HCRM ID");
      }
    } catch (err) {
      const extractErrorMessage = (err) => {
        let message = err?.response?.data;

        if (!message) return err?.message || "No data found for this HCRM ID";

        // If HTML response
        if (typeof message === "string" && message.includes("<pre>")) {
          const match = message.match(/<pre>(.*?)<br>/);
          if (match) {
            return match[1].replace("Error: ", "");
          }
        }

        return message;
      };

      toast.error(extractErrorMessage(err));

      // toast.error(err?.response?.data?.message || err?.message || "No data found for this HCRM ID");
    } finally {
      setHcrmSearchLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Bind ticket data
  // ─────────────────────────────────────────────────────────────────────────────
  const bindTicketData = ({ customer, product, ticket: ticketData }, { successMessage, ticketId }) => {
    // ── Try to match against already-loaded customerProducts (same as CreateTicket) ──
    // Also immediately call phone API to populate customerProducts for cascade auto-select
    const matchedProduct = customerProducts.find((p) => p.productId === product.productId);

    if (matchedProduct) {
      setSelectedCustomerProduct(matchedProduct);
    } else {
      // ── Fallback: build a synthetic selectedCustomerProduct from the API product
      // response so the cascade effects can still auto-select sub-category, model etc.
      // This will be replaced once fetchCustomerByPhone resolves and customerProducts loads.
      setSelectedCustomerProduct({
        productId: product.productId,
        productCode: product.PRODUCT_ID_HISENSE,
        customerProductId: product.customerProductId,
        categoryId: product.categoryId,
        category: product.category,
        subCategoryId: product.subCategoryId,
        modelSpecificationId: product.modelSpecificationId,
        customerModelId: product.customerModelId,
      });
    }

    // ── Also fetch real customerProducts via phone API (same as CreateTicket) ──
    if (customer.primaryPhone?.length === 10) {
      fetchCustomerByPhone(customer.primaryPhone, product.productId);
    }
    setValues((prev) => ({
      ...prev,
      // ── Customer (all readonly) ────────────────────────────────────────────
      CUSTOMER_ID: customer.id,
      TITLE: customer.title,
      END_FIRST_NAME: customer.firstName,
      END_LAST_NAME: customer.lastName,
      END_USER_TYPE: customer.userType,
      END_COMP_NAME: customer.companyName || "",
      END_TELEPHONE: customer.primaryPhone,
      END_CELL_PHONE: customer.alternatePhone || "",
      END_EMAIL: customer.email,
      END_ZIP_CODE: customer.zipCode,
      END_CITY: customer.city,
      END_PROVINCE: customer.province,
      END_ADDRESS1: customer.addressLine1,
      END_ADDRESS2: customer.addressLine2 || "",
      END_ADDRESS3: customer.addressLine3 || "",
      END_Socials: customer.social || {},
      // ── Product ───────────────────────────────────────────────────────────
      ...(matchedProduct ? { Category: matchedProduct.category || "", CATEGORY_ID: matchedProduct.categoryId || "" } : {}),
      //   Category_Code: product.categoryCode || "",
      customerProductId: product.customerProductId,
      PRODUCT_ID_HISENSE: product.PRODUCT_ID_HISENSE,
      PRODUCT_ID: product.productId,
      SERIALNO: product.serialNo,
      SERIALNO1: product.serialNoAlt || "",
      PURCHASE_DATE: product.purchaseDate?.split("T")[0] || "",
      PURCHASE_CHANNEL: product.purchaseChannel
        ? product.purchaseChannel.charAt(0).toUpperCase() + product.purchaseChannel.slice(1).toLowerCase()
        : "",
      PURCHASE_Partner: product.purchasePartner || "",
      WARRANTYPEID: product.warrantyTypeId || "",
      WARRANTYPE: product.warrantyTypeId === "O" ? "Out Warranty" : product.warrantyTypeId === "I" ? "In Warranty" : "",
      // ── Agent / Ticket ────────────────────────────────────────────────────
      ORDER_TYPE_ID: ticketData.orderTypeId,
      ORDER_TYPE_CODE: ticketData.orderTypeCode || "",
      ORDER_TYPE: ticketData.orderType || "",
      ORDER_SOURCE_ID: ticketData.orderSourceId,
      ORDER_SOURCE_CODE: ticketData.orderSourceCode || "",
      ORDER_SOURCE: ticketData.orderSource || "",
      SERVICE_TYPE_ID: ticketData.serviceTypeId,
      SERVICE_TYPE_CODE: ticketData.serviceTypeCode || "",
      SERVICE_TYPE: ticketData.serviceType || "",
      COMPLAINT_TYPE_ID: ticketData.complaintTypeId,
      COMPLAINT_TYPE_CODE: ticketData.complaintTypeCode || "",
      COMPLAINT_TYPE: ticketData.complaintType || "",
      CONSULTING_TYPE_ID: ticketData.consultingTypeId,
      CONSULTING_TYPE_CODE: ticketData.consultingTypeCode || "",
      CONSULTING_TYPE: ticketData.consultingType || "",
      SYMPTOM_1_ID: ticketData.symptom1Id,
      SYMPTOM_1_CODE: ticketData.symptom1Code || "",
      SYMPTOM_1: ticketData.symptom1 || "",
      SYMPTOM_2_ID: ticketData.symptom2Id,
      SYMPTOM_2_CODE: ticketData.symptom2Code || "",
      SYMPTOM_2: ticketData.symptom2 || "",
      SECTION_ID: ticketData.sectionId,
      SECTION_CODE: ticketData.sectionCode || "",
      SECTION: ticketData.section || "",
      DEFECT_ID: ticketData.defectId,
      DEFECT_CODE: ticketData.defectCode || "",
      DEFECT: ticketData.defect || "",
      REPAIR_ID: ticketData.repairActionId,
      REPAIR_CODE: ticketData.repairCode || "",
      REPAIR: ticketData.repair || "",
      CONDITION_CODE: ticketData.conditionFlag,
      STATUS_ID: ticketData.statusId,
      STATUS_CODE: ticketData.statusCode || "",
      STATUS: ticketData.status || "",
      STAGE_ID: ticketData.stageId,
      STAGE_CODE: ticketData.stageCode || "",
      STAGE: ticketData.stage || "",
      ASSIGN_DATE: ticketData.assignDate?.split("T")[0] || prev.ASSIGN_DATE,
      problem_note: ticketData.problemNote || "",
      technician_remarks: "",
      ticketId: ticketData.id,
      ticketNumber: ticketData.ticketNumber,
      externalTicketNumber: ticketData.externalTicketNumber,
    }));

    setPincodeData((prev) => ({ ...prev, pincode: customer.zipCode, city: customer.city, provinceCode: customer.province }));
    setIsTicketReadOnly(true);
    setInternalTicketType(ticketData.application_type);
    if (successMessage) toast.success(successMessage);
  };

  // ── Fetch customer + products by phone (same API as CreateTicket) ─────────────
  const fetchCustomerByPhone = async (phone, currentProductId) => {
    try {
      const res = await api.get(`/customers/by-phone/${phone}`);
      if (res.data.success && res.data.customerExists) {
        const { products } = res.data.data;
        setCustomerProducts(products || []);
        // Once real products loaded, find the real match and update selectedCustomerProduct
        // const realMatch = (products || []).find((p) => p.productId === currentProductId);
        // if (realMatch) {
        //   setSelectedCustomerProduct(realMatch);
        // }
        const realMatch = (products || []).find((p) => p.productId === currentProductId);

        if (realMatch) {
          setSelectedCustomerProduct(realMatch);

          setValues((prev) => ({
            ...prev,
            Category: realMatch.category || "",
            CATEGORY_ID: realMatch.categoryId || "",
          }));
        }
      }
    } catch (err) {
      console.error("Phone API Error:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // handleChange
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "ORDER_SOURCE") {
      const obj = orderSources.find((item) => item.source_code === value);
      setValues((prev) => ({ ...prev, ORDER_SOURCE_CODE: value, ORDER_SOURCE: obj?.source_name || "", ORDER_SOURCE_ID: obj?.id || "" }));
      return;
    }
    if (name === "ORDER_TYPE") {
      const obj = orderTypes.find((item) => item.order_type === value);
      setValues((prev) => ({
        ...prev,
        ORDER_TYPE_CODE: value,
        ORDER_TYPE: obj?.order_type_name || "",
        ORDER_TYPE_ID: obj?.id || "",
        SERVICE_TYPE: "",
        SERVICE_TYPE_CODE: "",
        SERVICE_TYPE_ID: "",
        COMPLAINT_TYPE: "",
        COMPLAINT_TYPE_CODE: "",
        COMPLAINT_TYPE_ID: "",
        CONSULTING_TYPE: "",
        CONSULTING_TYPE_CODE: "",
        CONSULTING_TYPE_ID: "",
        SYMPTOM_1: "",
        SYMPTOM_1_ID: "",
        SYMPTOM_1_CODE: "",
        SYMPTOM_2: "",
        SYMPTOM_2_ID: "",
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "SERVICE_TYPE") {
      const obj = serviceTypes.find((item) => item.service_type_name === value);
      setValues((prev) => ({
        ...prev,
        SERVICE_TYPE: value,
        SERVICE_TYPE_CODE: obj?.service_type_code || "",
        SERVICE_TYPE_ID: obj?.id || "",
      }));
      return;
    }
    if (name === "CONSULTING_TYPE") {
      // const obj = consultingTypes.find((item) => item.code === value);
       const obj = consultingTypes.find((item) => Number(item.id) === Number(value));
      setValues((prev) => ({
        ...prev,
        CONSULTING_TYPE_CODE: value,
        CONSULTING_TYPE: obj?.name || "",
        CONSULTING_TYPE_ID: obj?.id || "",
        COMPLAINT_TYPE_CODE: "",
        COMPLAINT_TYPE: "",
        SERVICE_TYPE: "",
        SERVICE_TYPE_CODE: "",
        SERVICE_TYPE_ID: "",
        COMPLAINT_TYPE_ID: "",
        SYMPTOM_1_CODE: "",
        SYMPTOM_1_ID: "",
        SYMPTOM_1: "",
        SYMPTOM_2: "",
        SYMPTOM_2_ID: "",
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "COMPLAINT_TYPE") {
      const obj = complaintTypes.find((item) => item.code === value);
      setValues((prev) => ({
        ...prev,
        COMPLAINT_TYPE_CODE: value,
        COMPLAINT_TYPE: obj?.name || "",
        COMPLAINT_TYPE_ID: obj?.id || "",
        CONSULTING_TYPE_CODE: "",
        CONSULTING_TYPE: "",
        SERVICE_TYPE: "",
        SERVICE_TYPE_CODE: "",
        SERVICE_TYPE_ID: "",
        CONSULTING_TYPE_ID: "",
        SYMPTOM_1_CODE: "",
        SYMPTOM_1_ID: "",
        SYMPTOM_1: "",
        SYMPTOM_2: "",
        SYMPTOM_2_ID: "",
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "PRODUCT_IDS_ID") {
      const product = productIds.find((item) => Number(item.id) === Number(value));
      setValues((prev) => ({ ...prev, PRODUCT_ID: value, PRODUCT_ID_HISENSE: product?.product_code || "" }));
      return;
    }
    if (name === "Category") {
      const selectedCat = categories.find((cat) => cat.name === value);
      const matched = customerProducts.find((p) => p.categoryId === selectedCat?.id);
      setSelectedCustomerProduct(matched || null);
      setValues((prev) => ({
        ...prev,
        Category: value,
        CATEGORY_ID: selectedCat?.id || "",
        Category_Code: selectedCat?.code || "",
        SUB_CATEGORY_ID: "",
        MODEL_SPEC_ID: "",
        CUSTOMER_MODEL_ID: "",
        SYMPTOM_1_CODE: "",
        SYMPTOM_1_ID: "",
        SYMPTOM_1: "",
        SYMPTOM_2: "",
        SYMPTOM_2_ID: "",
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "SYMPTOM_1") {
      const obj = symptomsL1.find((item) => item.symptom_1_name === value);
      setValues((prev) => ({
        ...prev,
        SYMPTOM_1: value,
        SYMPTOM_1_CODE: obj?.symptom_1_code || "",
        SYMPTOM_1_ID: obj?.id || "",
        SYMPTOM_2: "",
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "SYMPTOM_2") {
      const obj = symptomsL2.find((item) => item.symptom_2_name === value);
      setValues((prev) => ({
        ...prev,
        SYMPTOM_2: value,
        SYMPTOM_2_CODE: obj?.symptom_2_code || "",
        SYMPTOM_2_ID: obj?.id || "",
        SECTION: "",
        SECTION_CODE: "",
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "SECTION") {
      const obj = sections.find((item) => item.description === value);
      setValues((prev) => ({
        ...prev,
        SECTION: value,
        SECTION_CODE: obj?.section_code || "",
        SECTION_ID: obj?.id || "",
        DEFECT: "",
        DEFECT_CODE: "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "DEFECT") {
      const obj = defects.find((item) => item.defect_description === value);
      setValues((prev) => ({
        ...prev,
        DEFECT: value,
        DEFECT_CODE: obj?.defect_code || "",
        DEFECT_ID: obj?.id || "",
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "REPAIR") {
      const obj = repairs.find((item) => item.repair_code === value);
      setValues((prev) => ({
        ...prev,
        REPAIR: obj?.repair_description || "",
        REPAIR_CODE: obj?.repair_code || "",
        REPAIR_ID: obj?.id || "",
      }));
      return;
    }
    if (name === "STATUS") {
      const obj = availableStatuses.find((s) => s.status_code === value);
      setValues((prev) => ({
        ...prev,
        STATUS: obj?.status_description || "",
        STATUS_CODE: value,
        STATUS_ID: obj?.id || "",
        STAGE: "",
        STAGE_CODE: "",
        STAGE_ID: "",
      }));
      return;
    }

    const sapSanitizeFields = [
      "END_FIRST_NAME",
      "END_LAST_NAME",
      "END_ADDRESS1",
      "END_ADDRESS2",
      "END_ADDRESS3",
      "problem_note",
      "agent_remarks",
      "PURCHASE_Partner",
      "END_COMP_NAME",
      "technician_remarks",
    ];

    if (sapSanitizeFields.includes(name)) {
      value = sanitizeSapText(value);
    }

    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckWarranty = async () => {
    if (!values.CUSTOMER_MODEL || !values.PURCHASE_DATE || !values.PURCHASE_CHANNEL) {
      toast.error("Model, Purchase Date, or Channel may be empty");
      return;
    }
    try {
      setWarrantyLoading(true);
      const channelCode = values.PURCHASE_CHANNEL.toLowerCase() === "online" ? 10 : 20;
      const res = await api.post("/products/check-warranty", {
        customerModel: values.CUSTOMER_MODEL,
        purchaseDate: values.PURCHASE_DATE,
        channelCode,
      });
      if (res.data.success) {
        const { warrantyType, warrantyEndDate } = res.data.data;
        setValues((prev) => ({
          ...prev,
          WARRANTYPE: warrantyType === "I" ? "In Warranty" : "Out Warranty",
          WARRANTYPEID: warrantyType,
          WTY_END_DAY: warrantyEndDate,
        }));
        setIsWarrantyLocked(true);
      }
    } catch (err) {
      toast.error("Warranty check failed");
    } finally {
      setWarrantyLoading(false);
    }
  };

  const handleAttachmentUpload = (sno, file) => {
    setAttachmentFiles((prev) => ({ ...prev, [sno]: file }));
    setAttachmentStatuses((prev) => ({ ...prev, [sno]: "Pending" }));
    toast.success(`${ALL_ATTACHMENTS.find((a) => a.sno === sno)?.label} uploaded`);
  };

  // Tech Validation: update decision or remark for a fetched attachment
  const handleAttachmentDecisionChange = (attachmentId, decision, remark) => {
    setAttachmentDecisions((prev) => ({
      ...prev,
      [attachmentId]: {
        decision,
        remark: remark !== undefined ? remark : prev[attachmentId]?.remark || "",
      },
    }));
  };

  const isSymptomSectionMandatory = () => {
    if (values.ORDER_TYPE_CODE === "ZSV1") return true;
    if (values.ORDER_TYPE_CODE === "ZWO4" && Number(values.CONSULTING_TYPE_ID) === 2) return true;
    return false;
  };

  const shouldShowSymptomSection = () => {
    if (values.ORDER_TYPE_CODE === "ZSV1") return true;
    if (values.ORDER_TYPE_CODE === "ZWO3") return true;
    // const allowed = ["C02", "C05", "C10", "C11", "C12"];
    const allowed = [2,5,10,11,12]; // example ids

    if (values.ORDER_TYPE_CODE === "ZWO4" && allowed.includes(Number(values.CONSULTING_TYPE_ID))) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.technician_remarks?.trim()) {
      toast.error(`${isTechValidation ? "Agent" : "Technician"} Remarks are required to update the ticket`);
      return;
    }

    const mandatory = isSymptomSectionMandatory();

    if (mandatory) {
      //|| !values.REPAIR
      if (!values.SYMPTOM_1 || !values.SECTION || !values.DEFECT || !values.problem_note?.trim()) {
        toast.error("Symptom details or Problem Note are mandatory for this Order Type");
        setLoading(false);
        return;
      }
    }

    if (values.CATEGORY_ID) {
      if (!values.SUB_CATEGORY_ID) {
        toast.error("Sub Category is mandatory when a Category is selected");
        return;
      }
      if (!values.MODEL_SPEC_ID) {
        toast.error("Model Specification is mandatory when a Category is selected");
        return;
      }
      if (!values.CUSTOMER_MODEL_ID) {
        toast.error("Customer Model is mandatory when a Category is selected");
        return;
      }
      if (!values.PRODUCT_ID) {
        toast.error("Product ID is mandatory when a Category is selected");
        return;
      }
      if (!values.PURCHASE_DATE) {
        toast.error("Purchase Date is mandatory when a Category is selected");
        return;
      }
      if (!values.PURCHASE_CHANNEL) {
        toast.error("Purchase Channel is mandatory when a Category is selected");
        return;
      }
      if (!values.PURCHASE_Partner) {
        toast.error("Purchase Partner is mandatory when a Category is selected");
        return;
      }
      if (!values.WARRANTYPEID) {
        toast.error("Warranty Type is required");
        return;
      }
    }
    // ── Tech Validation mode: no file uploads, hit both APIs ─────────────────────
    if (isTechValidation) {
      // Require all attachments to have a decision
      const pendingCount = Object.values(attachmentDecisions).filter((d) => d.decision === "PENDING").length;
      if (fetchedAttachments.length > 0 && pendingCount > 0) {
        toast.error(`Please Approve or Decline all attachments (${pendingCount} still pending)`);
        return;
      }
      // Require remark for every DECLINED attachment
      const missingRemark = fetchedAttachments.find(
        (a) => attachmentDecisions[a.attachment_id]?.decision === "DECLINED" && !attachmentDecisions[a.attachment_id]?.remark?.trim(),
      );
      if (missingRemark) {
        toast.error(`Please provide a remark for declined attachment: "${missingRemark.attachment_type?.replace(/_/g, " ")}"`);
        return;
      }

      try {
        setLoading(true);
        values.agent_remarks = values.technician_remarks?.trim() || "";
        // 1️⃣ agent-remark — same fields as normal but plain JSON (no files)
        await api.patch(`/tickets/${values.ticketId}/agent-remark`, {
          agentRemark: values.technician_remarks,
          finalPayload: values,
          applicationType: ticketType,
          IS_CONSULTING: true,
          isL1: false,
        });

        // 2️⃣ attachments/validate — only if there are fetched attachments
        if (fetchedAttachments.length > 0) {
          const validatePayload = {
            attachments: fetchedAttachments.map((a) => {
              const d = attachmentDecisions[a.attachment_id];
              const entry = { attachmentId: a.attachment_id, status: d.decision };
              if (d.remark?.trim()) entry.remark = d.remark.trim();
              return entry;
            }),
          };
          await api.patch(`/tickets/${urlTicketId}/attachments/validate`, validatePayload);
        }

        toast.success("Ticket validated successfully!");
        setIsSaved(true);
        navigate(`/tech-validation-int`);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to validate ticket");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Normal (external) mode ────────────────────────────────────────────────────
    const missingAttachments = visibleAttachments.filter((attachment) => {
      if (attachment.sno === 4) return false; // Others is optional
      return !attachmentFiles[attachment.sno];
    });

    if (missingAttachments.length > 0) {
      toast.error(`Missing required attachment(s): ${missingAttachments.map((a) => a.label).join(", ")}`);
      return;
    }
    try {
      const formData = new FormData();
      values.agent_remarks = values.technician_remarks?.trim() || "";
      formData.append("agentRemark", values.technician_remarks);
      formData.append("finalPayload", JSON.stringify(values));
      formData.append("applicationType", ticketType === "Exchange" ? "EXCHANGE" : ticketType);
      formData.append("IS_CONSULTING", false);
      formData.append("isL1", false);

      Object.entries(attachmentFiles).forEach(([sno, file]) => {
        const attachmentConfig = ALL_ATTACHMENTS.find((a) => a.sno === Number(sno));
        formData.append("files", file);
        formData.append(
          "filesMeta[]",
          JSON.stringify({ sno: Number(sno), key: attachmentConfig?.attachmentKey || "", label: attachmentConfig?.label || "" }),
        );
      });

      setLoading(true);
      await api.patch(`/tickets/${values.ticketId}/agent-remark`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ticket updated successfully!");
      clearTicketSelection();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  const clearTicketSelection = () => {
    setIsTicketReadOnly(false);
    setSelectedCustomerProduct(null);
    setCustomerProducts([]);
    setSubCategories([]);
    setModelSpecifications([]);
    setCustomerModels([]);
    setProductIds([]);
    setIsSaved(false);
    setValues(INITIAL_VALUES);
    setHcrmSearchQuery("");
    setAttachmentFiles({});
    setAttachmentStatuses({});
  };

  const socialPlatforms = [
    { key: "x", label: "X", prefix: "@" },
    { key: "facebook", label: "Facebook", prefix: "" },
    { key: "linkedin", label: "LinkedIn", prefix: "in/" },
    { key: "instagram", label: "Instagram", prefix: "@" },
    { key: "youtube", label: "YouTube", prefix: "" },
  ];

  const handleSocialChange = (platform, value) => {
    setValues((prev) => ({
      ...prev,
      END_Socials: {
        ...prev.END_Socials,
        [platform]: value,
      },
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-linear-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Preview Modal */}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-1.5 p-2">
        {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-center bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-l font-extrabold  text-gray-900 bg-linear-to-r">Tech Validation</h3>
            {isTechValidation ? (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                INTERNAL VALIDATION ({internalTicketType})
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                EXTERNAL
              </span>
            )}
          </div>
          {/* {isTicketReadOnly && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Ticket #{selectedTicketId} loaded — Customer info is read-only, other fields editable
            </span>
          )} */}
          {/* Ticket Type + HCRM Search */}
          {isTechValidation ? null : (
            <div className="flex items-center gap-2">
              {/* Ticket Type Dropdown */}
              <div className="relative">
                <select
                  value={ticketType}
                  onChange={(e) => {
                    setTicketType(e.target.value);
                    // reset HCRM on type change
                    if (isTicketReadOnly) clearTicketSelection();
                  }}
                  className="appearance-none pl-3 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none bg-white cursor-pointer"
                >
                  <option value="">Ticket Type</option>
                  <option value="DOA">DOA</option>
                  <option value="Exchange">Exchange</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* HCRM Search */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder={ticketType ? "Enter HCRM ID..." : "Choose ticket type first"}
                  disabled={!ticketType}
                  className={`flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all min-w-[180px] ${!ticketType ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                  value={hcrmSearchQuery}
                  onChange={(e) => setHcrmSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleHcrmSearch())}
                />
                <button
                  type="button"
                  onClick={handleHcrmSearch}
                  disabled={hcrmSearchLoading || !ticketType}
                  className={`px-2.5 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap ${
                    hcrmSearchLoading || !ticketType ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {hcrmSearchLoading ? <CircularProgress size={12} color="inherit" /> : <Search size={12} />}
                  {hcrmSearchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Three Columns ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
          {/* COLUMN 1 — Customer Information (all readonly) */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={User} title="Customer Information" />

            {/* Phone — readonly, auto-filled by HCRM search */}
            <div className="relative">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Primary Contact No</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  placeholder="Auto-filled from HCRM ID search"
                  className="w-full pl-3 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-600 cursor-not-allowed select-none"
                  value={values.END_TELEPHONE}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <FormField
                label="Title"
                name="TITLE"
                type="select"
                options={[
                  { label: "Mr.", value: "MR" },
                  { label: "Ms.", value: "MS" },
                  { label: "Mrs.", value: "MRS" },
                ]}
                value={values.TITLE}
                onChange={handleChange}
                disabled
              />
              <div className="col-span-2">
                <FormField
                  label="User Type"
                  name="END_USER_TYPE"
                  type="select"
                  options={[
                    { label: "Dealer", value: "DEALER" },
                    { label: "Distributor", value: "DISTRIBUTOR" },
                    { label: "Customer", value: "CUSTOMER" },
                  ]}
                  value={values.END_USER_TYPE}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="First Name" name="END_FIRST_NAME" value={values.END_FIRST_NAME} onChange={handleChange} readOnly />
              <FormField label="Last Name" name="END_LAST_NAME" value={values.END_LAST_NAME} onChange={handleChange} readOnly />
            </div>

            <FormField label="Email Address" name="END_EMAIL" type="email" value={values.END_EMAIL} onChange={handleChange} readOnly />
            <FormField label="Alternate Contact" name="END_CELL_PHONE" value={values.END_CELL_PHONE} onChange={handleChange} readOnly />
            <FormField label="Company Name" name="END_COMP_NAME" value={values.END_COMP_NAME} onChange={handleChange} readOnly />

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Pincode" name="END_ZIP_CODE" value={values.END_ZIP_CODE} onChange={handleChange} readOnly />
              <FormField label="City" name="END_CITY" value={pincodeData.city || values.END_CITY} onChange={handleChange} readOnly />
            </div>

            <FormField
              label="Province"
              name="END_PROVINCE"
              value={pincodeData.provinceCode || values.END_PROVINCE}
              onChange={handleChange}
              readOnly
            />
            <FormField label="Address Line 1" name="END_ADDRESS1" value={values.END_ADDRESS1} onChange={handleChange} readOnly />
            <FormField label="Address Line 2" name="END_ADDRESS2" value={values.END_ADDRESS2} onChange={handleChange} readOnly />
            <FormField label="Address Line 3" name="END_ADDRESS3" value={values.END_ADDRESS3} onChange={handleChange} readOnly />
            {/* Social handles logic remains same but uses handleSocialChange correctly */}
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowSocials(!showSocials)}
                className="w-full flex items-center cursor-pointer justify-between px-4 py-3 text-left"
              >
                <span className="text-xs font-medium text-gray-700">Social Media Handle</span>
                <span className="text-gray-400 text-xs">{showSocials ? "▲" : "▼"}</span>
              </button>
              {showSocials && (
                <div className="px-4 pb-1 space-y-1 border-t border-gray-100">
                  {socialPlatforms.map((platform) => (
                    <div key={platform.key} className="grid grid-cols-2 gap-2 items-center">
                      <label className="text-xs text-gray-600">{platform.label}</label>
                      <div className="relative">
                        {platform.prefix && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{platform.prefix}</span>
                        )}
                        <input
                          type="text"
                          className={`w-full ${platform.prefix ? "pl-7" : "pl-3"} pr-3 py-1 border border-gray-300 rounded-lg text-xs`}
                          value={values.END_Socials?.[platform.key] || ""}
                          onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2 — Product Information */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={Package} title="Product Information" />

            {/* Category — auto-filled but editable */}
            <CategorySelectField
              label="Category"
              name="Category"
              //   customerProducts={[...new Set(customerProducts.map((p) => p.category))]}
              allProducts={categories.map((cat) => cat.name)}
              required
              value={values.Category}
              onChange={handleChange}
              disabled
            />

            <FormField
              label="Sub Category"
              name="SubCategory"
              type="select"
              options={subCategories.map((sub) => ({ label: sub.name, value: sub.id }))}
              required
              disabled={!values.CATEGORY_ID || subCategoriesLoading}
              value={values.SUB_CATEGORY_ID || ""}
              onChange={(e) => {
                const id = e.target.value;
                const obj = subCategories.find((s) => s.id === Number(id));
                setValues((prev) => ({ ...prev, SUB_CATEGORY_ID: id, subCategory: obj?.name || "" }));
              }}
            />
            <FormField
              label="Model Specification"
              name="MODEL_SPEC_ID"
              type="select"
              options={modelSpecifications.map((m) => ({ label: m.spec_value, value: m.id }))}
              required
              disabled={!values.SUB_CATEGORY_ID || modelLoading}
              value={values.MODEL_SPEC_ID || ""}
              onChange={(e) => {
                const id = e.target.value;
                const obj = modelSpecifications.find((m) => m.id === Number(id));
                setValues((prev) => ({ ...prev, MODEL_SPEC_ID: id, modelSpecification: obj?.spec_value || "" }));
              }}
            />
            <FormField
              label="Customer Model"
              name="CUSTOMER_MODEL_ID"
              type="select"
              options={customerModels.map((m) => ({ label: m.model_number, value: m.id }))}
              required
              disabled={!values.MODEL_SPEC_ID || customerModelLoading}
              value={values.CUSTOMER_MODEL_ID || ""}
              onChange={(e) => {
                const id = e.target.value;
                const obj = customerModels.find((m) => m.id === Number(id));
                setValues((prev) => ({ ...prev, CUSTOMER_MODEL_ID: id, CUSTOMER_MODEL: obj?.model_number || "", PRODUCT_ID: "" }));
                setProductIds([]);
              }}
            />
            <FormField
              label="Product ID"
              name="PRODUCT_IDS_ID"
              type="select"
              options={productIds.map((item) => ({ label: item.product_code, value: item.id }))}
              disabled={!values.CUSTOMER_MODEL_ID || productIdsLoading}
              value={values.PRODUCT_ID || ""}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Serial No" name="SERIALNO" value={values.SERIALNO} onChange={handleChange} />
              <FormField label="Serial No 1" name="SERIALNO1" value={values.SERIALNO1} onChange={handleChange} />
            </div>

            <FormField
              label="Purchase Date"
              name="PURCHASE_DATE"
              type="date"
              required
              value={values.PURCHASE_DATE}
              onChange={handleChange}
            />
            <FormField
              label="Purchase Channel"
              name="PURCHASE_CHANNEL"
              type="select"
              options={["Online", "Offline"]}
              required
              value={values.PURCHASE_CHANNEL}
              onChange={handleChange}
            />
            {values.PURCHASE_CHANNEL === "Online" ? (
              <FormField
                label="Purchase Partner"
                name="PURCHASE_Partner"
                type="select"
                options={["Amazon", "Flipkart", "Others"]}
                value={values.PURCHASE_Partner}
                onChange={handleChange}
              />
            ) : values.PURCHASE_CHANNEL === "Offline" ? (
              <FormField label="Purchase Partner" name="PURCHASE_Partner" value={values.PURCHASE_Partner} onChange={handleChange} />
            ) : null}

            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormField
                    label="Warranty Type"
                    name="WARRANTYPE"
                    type="select"
                    options={["In Warranty", "Out Warranty"]}
                    required={!!values.CATEGORY_ID}
                    disabled={true}
                    value={values.WARRANTYPE}
                    onChange={handleChange}
                  />
                  {/* <FormField
                    label="Warranty Type"
                    name="WARRANTYPE"
                    type="select"
                    options={["In Warranty", "Out Warranty"]}
                    required
                    value={values.WARRANTYPE}
                    onChange={(e) => {
                      const type = e.target.value;

                      setValues((prev) => ({
                        ...prev,
                        WARRANTYPE: type,
                        WARRANTYPEID: type === "Out Warranty" ? "O" : "I",
                      }));
                    }}
                  /> */}
                </div>
                <button
                  type="button"
                  onClick={handleCheckWarranty}
                  disabled={warrantyLoading || values.VOID_WARRANTY}
                  className={`px-1.5 py-2 text-xs cursor-pointer font-semibold text-white rounded transition-colors ${warrantyLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                  {warrantyLoading ? "Checking..." : "Check Warranty"}
                </button>
              </div>
              {/* {values.WTY_END_DAY && (
                <span className="text-[10px] text-blue-600 font-bold italic">Warranty Valid Until: {values.WTY_END_DAY}</span>
              )} */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="VOID_WARRANTY"
                  checked={values.VOID_WARRANTY}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setValues((prev) => ({
                      ...prev,
                      VOID_WARRANTY: checked,
                      WARRANTYPE: checked ? "Out Warranty" : isWarrantyLocked ? prev.WARRANTYPE : "",
                    }));
                  }}
                  className="h-3 w-3 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="VOID_WARRANTY" className="text-[11px] text-gray-500 cursor-pointer">
                  Void Warranty
                </label>
              </div>
            </div>
          </div>

          {/* COLUMN 3 — Agent Input (symptom→repair editable, rest readonly) */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={Wrench} title="Agent Input" />
            <div className="grid grid-cols-2 gap-2">
              <FormField label="HCRM ID" name="HCRM_ID" disabled value={values?.externalTicketNumber} onChange={handleChange} />
              <FormField
                label="Order Source"
                name="ORDER_SOURCE"
                type="select"
                options={orderSources.map((item) => ({ label: item.source_name, value: item.source_code }))}
                required
                disabled={orderSourceLoading || true}
                value={values.ORDER_SOURCE_CODE}
                onChange={handleChange}
              />
              <FormField
                label="Order Type"
                name="ORDER_TYPE"
                type="select"
                options={orderTypes.map((item) => ({ label: item.order_type_name, value: item.order_type }))}
                required
                disabled={orderTypeLoading || true}
                value={values.ORDER_TYPE_CODE}
                onChange={handleChange}
              />

              {values.ORDER_TYPE_CODE === "ZWO4" && (
                <FormField
                  label="Consulting Type"
                  name="CONSULTING_TYPE"
                  type="select"
             options={consultingTypes.map((item) => ({ label: item.name, value: item.id }))}
value={values.CONSULTING_TYPE_ID}
                  onChange={handleChange}
                  disabled
                />
              )}
              {values.ORDER_TYPE_CODE === "ZWO3" && (
                <FormField
                  label="Complaint Type"
                  name="COMPLAINT_TYPE"
                  type="select"
                  options={complaintTypes.map((item) => ({ label: item.name, value: item.code }))}
                  value={values.COMPLAINT_TYPE_CODE}
                  onChange={handleChange}
                  disabled
                />
              )}
              {values.ORDER_TYPE_CODE === "ZSV1" && (
                <>
                  <FormField
                    label="Service Type"
                    name="SERVICE_TYPE"
                    type="select"
                    options={serviceTypes.map((item) => item.service_type_name)}
                    required
                    disabled={serviceTypesLoading || true}
                    value={values.SERVICE_TYPE}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Assign Date"
                    name="ASSIGN_DATE"
                    type="date"
                    disabled
                    value={pincodeData.assignDate || values.ASSIGN_DATE}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </div>

            {/* Symptom→Repair: EDITABLE for technician */}
            {shouldShowSymptomSection() && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="Symptom 1"
                    name="SYMPTOM_1"
                    type="select"
                    options={symptomsL1.map((item) => item.symptom_1_name)}
                    required={isSymptomSectionMandatory()}
                    disabled={symptomsLoading}
                    value={values.SYMPTOM_1}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Symptom 2"
                    name="SYMPTOM_2"
                    type="select"
                    options={symptomsL2.map((item) => item.symptom_2_name)}
                    disabled={symptomsL2Loading || !values.SYMPTOM_1}
                    value={values.SYMPTOM_2}
                    onChange={handleChange}
                    required={isSymptomSectionMandatory()}
                  />
                </div>
                <FormField
                  label="Section"
                  name="SECTION"
                  type="select"
                  options={sections.map((item) => item.description)}
                  disabled={sectionsLoading || !values.SYMPTOM_2}
                  value={values.SECTION}
                  onChange={handleChange}
                />
                <FormField
                  label="Defect Description"
                  name="DEFECT"
                  type="select"
                  options={defects.map((item) => item.defect_description)}
                  disabled={defectsLoading || !values.SECTION}
                  value={values.DEFECT}
                  onChange={handleChange}
                />
                <FormField
                  label="Repair Description"
                  name="REPAIR"
                  type="select"
                  options={repairs.map((s) => ({ label: s.repair_description, value: s.repair_code }))}
                  disabled={repairsLoading || !values.DEFECT}
                  value={values.REPAIR_CODE}
                  onChange={handleChange}
                />
                <FormField
                  label="Condition Code"
                  name="CONDITION_CODE"
                  type="select"
                  options={[
                    { label: "Constant (1)", value: 1 },
                    { label: "Intermittent (0)", value: 0 },
                  ]}
                  value={values.CONDITION_CODE}
                  onChange={handleChange}
                />
              </>
            )}

            <FormField
              label="Status"
              name="STATUS"
              type="select"
              options={availableStatuses.map((s) => ({ label: s.status_description, value: s.status_code }))}
              value={values.STATUS_CODE}
              disabled={statusesLoading || !values.ORDER_TYPE_CODE || true}
              onChange={handleChange}
              required
            />

            {values.ORDER_TYPE_CODE === "ZSV1" && (
              <FormField
                label="Stage"
                name="STAGE"
                type="text"
                readOnly
                disabled
                placeholder={stagesLoading ? "Loading stage..." : "No stage available"}
                value={values.STAGE || ""}
              />
            )}
          </div>
        </div>

        {/* ── Problem Note (readonly) + Technician Remarks ─────────────────────── */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-lg space-y-2">
          <FormField
            label="Problem Note"
            name="problem_note"
            type="textarea"
            value={values.problem_note}
            onChange={handleChange}
            required
            // readOnly
          />
          <FormField
            label={isTechValidation ? "Agent Remarks" : "Technician Remarks"}
            name="technician_remarks"
            type="textarea"
            value={values.technician_remarks}
            onChange={handleChange}
          />
        </div>

        {/* ── Bottom Tabs: History | Attachments ──────────────────────────────── */}
        {values.CUSTOMER_ID && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveBottomTab("attachments")}
                className={`flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  activeBottomTab === "attachments"
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Paperclip size={13} />
                Attachments
                {ticketType && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${ticketType === "Exchange" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"}`}
                  >
                    {ticketType}
                  </span>
                )}
                {internalTicketType && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${internalTicketType === "Exchange" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"}`}
                  >
                    {internalTicketType}
                  </span>
                )}
              </button>
            </div>

            {/* ── Attachments Tab ──────────────────────────────────────────────── */}
            {activeBottomTab === "attachments" && (
              <div className="p-3">
                {/* ── Tech Validation Mode: show fetched attachments with accept/reject ── */}
                {isTechValidation ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={13} className="text-blue-500" />
                        <span className="text-xs font-semibold text-gray-700">Review & validate attachments submitted by the agent</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Approved
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-400" /> Rejected
                        </span>
                      </div>
                    </div>
                    {attachmentsLoading ? (
                      <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        <span className="text-xs font-medium">Loading attachments…</span>
                      </div>
                    ) : fetchedAttachments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Paperclip size={18} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">No attachments found for this ticket</p>
                      </div>
                    ) : (
                      <>
                        {/* Summary bar */}
                        <div className="flex items-center gap-4 mb-3 px-1">
                          <div className="flex gap-3 text-[10px] font-semibold">
                            <span className="text-emerald-600">
                              ✓ {Object.values(attachmentDecisions).filter((d) => d.decision === "APPROVED").length} Approved
                            </span>
                            <span className="text-red-500">
                              ✗ {Object.values(attachmentDecisions).filter((d) => d.decision === "REJECTED").length} Rejected
                            </span>
                            <span className="text-amber-600">
                              ⏳ {Object.values(attachmentDecisions).filter((d) => d.decision === "PENDING").length} Pending
                            </span>
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (Object.values(attachmentDecisions).filter((d) => d.decision !== "PENDING").length /
                                    Math.max(fetchedAttachments.length, 1)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap font-medium">
                            {Object.values(attachmentDecisions).filter((d) => d.decision !== "PENDING").length} /{" "}
                            {fetchedAttachments.length} reviewed
                          </span>
                        </div>
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-linear-to-r from-blue-500 to-blue-600 text-white">
                                <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide w-10">S.No</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">Attachment</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-20">Size</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-28">Uploaded By</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-32">Preview</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-44">Decision</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-24">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">Remark</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                              {fetchedAttachments.map((att, idx) => (
                                <TechValidationAttachmentRow
                                  key={att.attachment_id}
                                  sno={idx + 1}
                                  attachment={att}
                                  decision={attachmentDecisions[att.attachment_id]}
                                  onDecisionChange={handleAttachmentDecisionChange}
                                  onPreview={(a) =>
                                    setPreviewItem({
                                      url: a.file_path.replace(/\\/g, "/"),
                                      mime_type: a.mime_type,
                                      file_name: a.file_name,
                                    })
                                  }
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                ) : /* ── Normal Upload Mode ─────────────────────────────────────────── */
                !ticketType ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Paperclip size={18} className="text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Please select a Ticket Type (DOA or Exchange) to view required attachments
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">
                          {ticketType === "Exchange" ? "3 attachments required" : "9 attachments required"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticketType === "Exchange" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"}`}
                        >
                          {ticketType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Approved
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-400" /> Rejected
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="bg-linear-to-r from-blue-500 to-blue-600 text-white">
                            <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide w-10">S.No</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">Attachment Type</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-20">Type</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">Format Accepted</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-16">Size</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-24">Upload</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide w-24">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {visibleAttachments.map((attachment) => (
                            <AttachmentRow
                              key={attachment.sno}
                              attachment={attachment}
                              file={attachmentFiles[attachment.sno]}
                              status={attachmentStatuses[attachment.sno] || (attachmentFiles[attachment.sno] ? "Pending" : undefined)}
                              onUpload={handleAttachmentUpload}
                              disabled={!isTicketReadOnly && !values.CUSTOMER_ID}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Upload progress summary */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(attachmentFiles).length / visibleAttachments.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap font-medium">
                        {Object.keys(attachmentFiles).length} / {visibleAttachments.length} uploaded
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Footer Actions ───────────────────────────────────────────────────── */}
        <div className="flex justify-end items-center bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex gap-3">
            <SecondaryButton onClick={clearTicketSelection} type="button">
              Reset
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading || isSaved}>
              {loading ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <>
                  <Save size={17} className="mr-2" />
                  Save Ticket
                </>
              )}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}
