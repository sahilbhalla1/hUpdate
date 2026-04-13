import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { User, Package, Headphones, Save, Search, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { useSearchParams } from "react-router-dom";
import { createTicket } from "../../services/ticketsApi";
import api from "../../services/api";
import FormField from "./FormField";
import CategorySelectField from "./CategorySelectField";
import { convertUTCToIST } from "../../utils/timeFormat";
import { sanitizeSapText } from "../../utils/SanitizeInput";

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-blue-100">
    <div className="p-1.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
      <Icon size={16} className="text-white" />
    </div>
    <h4 className="font-bold text-gray-800 uppercase text-xs tracking-wide">{title}</h4>
  </div>
);
  const allowedStatuses = ["assigned", "acknowledged"];
export default function CreateTicket() {

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

    IS_TRANSFER: null,  // ✅ ADD THIS
    END_Socials: {},

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
    // agent
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
    FOLLOW_UP_DATETIME: "",
    spOrderNumber: "",
  };
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSocials, setShowSocials] = useState(false);
  const [values, setValues] = useState(INITIAL_VALUES);

  const [pincodeData, setPincodeData] = useState({
    pincode: "",
    city: "",
    state: "",
    provinceCode: "",
    sla: "",
  });

  const [customerProducts, setCustomerProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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
  // const [warrantyData, setWarrantyData] = useState(null);

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

  const [isWarrantyLocked, setIsWarrantyLocked] = useState(false);

  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  const [stagesLoading, setStagesLoading] = useState(false);

  const [consultingTypes, setConsultingTypes] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);

  const [ticketHistory, setTicketHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);
  const [isTicketReadOnly, setIsTicketReadOnly] = useState(false);
  const [pendingProductId, setPendingProductId] = useState(null); // fallback if customerProducts not yet loaded

  const [isSaved, setIsSaved] = useState(false);
  const [hcrmSearchQuery, setHcrmSearchQuery] = useState("");
  const [hcrmSearchLoading, setHcrmSearchLoading] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [timelineData, setTimelineData] = useState({});
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

const [modelSearch, setModelSearch] = useState("");
 
const [modelSearchLoading, setModelSearchLoading] = useState(false);

const [srMode, setSrMode] = useState("EXISTING"); 
// EXISTING | NEW

const [existingSrList, setExistingSrList] = useState([]);
const [selectedSrExternal, setSelectedSrExternal] = useState("");

  const [phoneSearchLoading, setPhoneSearchLoading] = useState(false);
 
    const [expandedSection, setExpandedSection] = useState(null);

const filteredServiceTypes = serviceTypes.filter((item) => {
  if (values.Category_Code === "AC1") {
    return true; // show all including 09
  }

  // for non-AC → remove 09
  return item.service_type_code !== "09";
});

const fetchExistingSR = async (phone) => {
  try {
    const res = await api.get(`/tickets/service-requests?phone=${phone}`);

    if (res.data.success) {
      setExistingSrList(res.data.data);

      console.log("data agya h ");
      console.log(res.data.data);
      console.log(res.data.data.length);
      
    }
  } catch (err) {
    console.error("SR fetch error", err);
  }
};

const duplicateKey = `${values.CUSTOMER_ID || ""}-${values.customerProductId || ""}-${values.ORDER_TYPE_ID || ""}`;

const checkDuplicateTicket = async () => {
  try {
    const res = await api.post("/tickets/check-duplicate", {
      orderTypeCode: values.ORDER_TYPE_CODE,
      customerId: values.CUSTOMER_ID,
      customerProductId: values.customerProductId,
      orderTypeId: values.ORDER_TYPE_ID,
    });

    return res.data.data; // ✅ FIX
  } catch (err) {
    console.error("Duplicate check failed", err);
    return null;
  }
};

useEffect(() => {
  // guard: run only when all required values exist
  if (selectedTicketId) return;
  if (
    !values.CUSTOMER_ID ||
    !values.customerProductId ||
    !values.ORDER_TYPE_ID
  ) {
    return;
  }

  const debounce = setTimeout(async () => {
    const res = await checkDuplicateTicket();

    if (res?.isDuplicate) {
      toast.warning(res.message || "Open ticket already exists");
    }
  }, 400); // debounce to prevent rapid calls

  return () => clearTimeout(debounce);
}, [duplicateKey, selectedTicketId]);

  const isL2 = searchParams.get("l2") === "true";
  const isL3 = searchParams.get("l3") === "true";
  const isConsulting = searchParams.get("consulting") === "true";
  const isTransfer = searchParams.get("tranferticket") === "true";

  

  const urlTicketId = searchParams.get("id");

  const bindTicketData = ({ customer, product, ticket: ticketData }, { successMessage, ticketId }) => {
    const matchedProduct = customerProducts.find((p) => p.productId === product.productId);
    if (matchedProduct) {
      setSelectedCustomerProduct(matchedProduct);
      setPendingProductId(null);
    } else {
      // customerProducts not loaded yet — store for fallback effect
      setPendingProductId(product.productId);
    }

    setValues((prev) => ({
      ...prev,
      // ── Customer ──────────────────────────────────────────────────────────
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
      // ── Product ───────────────────────────────────────────────────────────
      // ...(matchedProduct ? { Category: matchedProduct.category || "", CATEGORY_ID: matchedProduct.categoryId || "" } : {}),
      customerProductId: product.customerProductId,
      PRODUCT_ID_HISENSE: product.PRODUCT_ID_HISENSE,
      Category: product.category || "",
CATEGORY_ID: product.categoryId || "",

SUB_CATEGORY_ID: product.subCategoryId || "",
MODEL_SPEC_ID: product.modelSpecId || "",
CUSTOMER_MODEL_ID: product.customerModelId || "",

customerProductId: product.customerProductId,
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
     IS_TRANSFER: isTransfer ? false : Boolean(ticketData.isTransferred),// ✅ ADD THIS
      ASSIGN_DATE: ticketData.assignDate?.split("T")[0] || prev.ASSIGN_DATE,
      problem_note: ticketData.problemNote || "",
      agent_remarks: "",
      ticketId: ticketData.id,
      ticketNumber: ticketData.ticketNumber,
      externalTicketNumber: ticketData.externalTicketNumber,
      spOrderNumber: ticketData.spOrderNumber,
      FOLLOW_UP_DATETIME: ticketData.FOLLOW_UP_DATETIME,
    }));

    setPincodeData((prev) => ({
      ...prev,
      pincode: customer.zipCode,
      city: customer.city,
      provinceCode: customer.province,
    }));

    setSearchQuery(customer.primaryPhone);
    fetchTicketHistoryByPhone(customer.primaryPhone);
    setSelectedTicketId(ticketId ?? ticketData.id);
    // setIsTicketReadOnly(true);
    setIsTicketReadOnly(!isTransfer);
    if (successMessage) toast.success(successMessage);
  };

  // ── Select ticket from history table (internal) ───────────────────────────
  const handleSelectTicket = async (ticket) => {
    // if (ticket.status?.toLowerCase() !== "assigned") return;
     if (!allowedStatuses.includes(ticket.status?.trim().toLowerCase())) {
  return;
}

    setSelectedTicketId(ticket.id);
    try {
      setTicketDetailsLoading(true);
      const res = await api.get(`/tickets/${ticket.id}/details`);
      if (res.data.success) {
        bindTicketData(res.data.data, {
          successMessage: `Ticket #${ticket.id} loaded successfully`,
          ticketId: ticket.id,
        });
      }
    } catch (err) {
      console.error("Ticket Details Error:", err);
      toast.error("Failed to load ticket details");
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  useEffect(() => {
  if (values.Category_Code !== "AC1" && values.SERVICE_TYPE_CODE === "09") {
    setValues((prev) => ({
      ...prev,
      SERVICE_TYPE: "",
      SERVICE_TYPE_CODE: "",
      SERVICE_TYPE_ID: "",
    }));
  }
}, [values.Category_Code]);

  // Fallback: if customerProducts loaded after ticket details, auto-select category
  useEffect(() => {
    if (!pendingProductId || customerProducts.length === 0) return;

    const matchedProduct = customerProducts.find((p) => p.productId === pendingProductId);
    if (matchedProduct) {
      setSelectedCustomerProduct(matchedProduct);
      setValues((prev) => ({
        ...prev,
        Category: matchedProduct.category || "",
        CATEGORY_ID: matchedProduct.categoryId || "",
      }));
      setPendingProductId(null);
    }
  }, [customerProducts, pendingProductId]);

  // Auto-load ticket details when navigated from ServiceTracking with ?id=X&l2=true or l3=true
  useEffect(() => {
    if (!urlTicketId || (!isL2 && !isL3 && !isConsulting && !isTransfer)) return;

    const loadTicketFromUrl = async () => {
      try {
        setTicketDetailsLoading(true);
        const res = await api.get(`/tickets/${urlTicketId}/details`);
        if (res.data.success) {
          bindTicketData(res.data.data, {
            successMessage: null, // silent — navigated via URL
            ticketId: Number(urlTicketId),
          });
        }
      } catch (err) {
        console.error("L2/L3 Ticket Load Error:", err);
        toast.error("Failed to load ticket details");
      } finally {
        setTicketDetailsLoading(false);
      }
    };

    loadTicketFromUrl();
  }, [urlTicketId, isL2, isL3,isConsulting, isTransfer]);

  const clearTicketSelection = () => {
    const phoneFromUrl = searchParams.get("phone");

    setSelectedTicketId(null);
    setIsTicketReadOnly(false);
    setPendingProductId(null);
    setSelectedCustomerProduct(null);
    setSubCategories([]);
    setModelSpecifications([]);
    setCustomerModels([]);
    setProductIds([]);
    setIsSaved(false);
setExpandedSection(null);      // ← ADD THIS
    setExpandedTimeline(null);  

    if (phoneFromUrl) {
      // Phone is locked from URL — preserve customer fields, only reset product/ticket fields
      setValues((prev) => ({
        ...prev,
        // Reset product fields
        customerProductId: "",
        PRODUCT_ID: "",
        PRODUCT_ID_HISENSE: "",
        Category: "",
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
        WTY_END_DAY: "",
        // Reset agent/ticket fields
        SERVICE_TYPE: "",
        SERVICE_TYPE_ID: "",
        SERVICE_TYPE_CODE: "",
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
        REPAIR_ID: "",
        REPAIR_CODE: "",
        STATUS: "",
        STATUS_CODE: "",
        STATUS_ID: "",
        STAGE: "",
        STAGE_CODE: "",
        STAGE_ID: "",
        problem_note: "",
        agent_remarks: "",
        ticketNumber: "",
        ASSIGN_DATE: "",
        spOrderNumber: "",
      }));
    } else {
      setValues(INITIAL_VALUES);
      setCustomerProducts([]);
      setPincodeData({ pincode: "", city: "", state: "", provinceCode: "", sla: "" });
      setTicketHistory([]);          // ← ADD THIS
      setTimelineData({});  
    }
  };

  const handleViewTicket = async (ticket) => {
    const ticketId = ticket.id;
    if (expandedTimeline === ticketId) {
      setExpandedTimeline(null);
      return;
    }
    setExpandedTimeline(ticketId);
    if (timelineData[ticketId]) return; // already fetched

    try {
      setTimelineLoading(true);
      const res = await api.get(`/tickets/${ticketId}/history`);
      if (res.data.success) {
        setTimelineData((prev) => ({ ...prev, [ticketId]: res.data.data }));
      } else {
        setTimelineData((prev) => ({ ...prev, [ticketId]: [] }));
      }
    } catch (err) {
      console.error("Timeline fetch error:", err);
      setTimelineData((prev) => ({ ...prev, [ticketId]: [] }));
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");

    if (!phoneFromUrl) return;

    setSearchQuery(phoneFromUrl);

    const fetchDirectly = async () => {
      if (phoneFromUrl.length === 10) {
        try {
          const res = await api.get(`/customers/by-phone/${phoneFromUrl}`);

          if (res.data.success && res.data.customerExists) {
            const { customer, products } = res.data.data;

            // Bind data same way as first effect
            setFilteredCustomers([customer]);
            setCustomerProducts(products || []);
            // Call the history API here as well
            fetchTicketHistoryByPhone(phoneFromUrl);
            fetchExistingSR(phoneFromUrl);
            // If you still want auto-select behavior
            handleCustomerSelect(customer);
          } else {
            // 🔥 Clear everything if invalid or changed
            resetCustomerData();
            setFilteredCustomers([]);
          }
        } catch (err) {
          resetCustomerData();
          setFilteredCustomers([]);
          toast.error("Could not find customer with that phone number");
        }
      } else {
        resetCustomerData();
        setFilteredCustomers([]);
      }
    };

    fetchDirectly();
  }, [searchParams]);

  const handleCustomerSelect = (customerData) => {
    setValues((prev) => ({
      ...prev,
      CUSTOMER_ID: customerData.id,
      END_USER_TYPE: customerData.userType,
      TITLE: customerData.title,
      END_FIRST_NAME: customerData.firstName,
      END_LAST_NAME: customerData.lastName,
      END_COMP_NAME: customerData.companyName || "",
      END_TELEPHONE: customerData.primaryPhone,
      END_CELL_PHONE: customerData.alternatePhone || "",
      END_EMAIL: customerData.email,
      END_ZIP_CODE: customerData.zipCode,
      END_CITY: customerData.city,
      END_PROVINCE: customerData.province,
      END_ADDRESS1: customerData.addressLine1,
      END_ADDRESS2: customerData.addressLine2 || "",
      END_ADDRESS3: customerData.addressLine3 || "",
      END_Socials: customerData.social || {},
    }));

    setPincodeData((prev) => ({
      ...prev,
      pincode: customerData.zipCode,
    }));

    // 🔥 Always validate via pincode API
    if (customerData.zipCode?.length === 6) {
      fetchPincodeDetails(customerData.zipCode);
    }

    setSearchQuery(customerData.primaryPhone);
    fetchTicketHistoryByPhone(customerData.primaryPhone);
    setShowSearchResults(false);
    fetchExistingSR(customerData.primaryPhone);
  };

  // useEffect(() => {
  //   const delayDebounce = setTimeout(() => {
  //     const fetchCustomerData = async () => {
  //       if (searchQuery.length === 10) {
  //         try {
  //           const res = await api.get(`/customers/by-phone/${searchQuery}`);

  //           if (res.data.success && res.data.customerExists) {
  //             const { customer, products } = res.data.data;
  //             setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
  //             setFilteredCustomers([customer]);
  //             setCustomerProducts(products || []);
  //           } else {
  //             // 🔥 IF NUMBER IS BEING CHANGED → CLEAR EVERYTHING
  //             resetCustomerData();
  //             setFilteredCustomers([]);
  //             setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
  //             toast.error("No data found for this phone number");
  //           }
  //         } catch (err) {
  //           resetCustomerData();
  //           setFilteredCustomers([]);
  //           setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
  //           toast.error("No data found for this phone number");
  //         }
  //       } else {
  //         setFilteredCustomers([]);
  //         setShowSearchResults(false);
  //       }
  //     };

  //     fetchCustomerData();
  //   }, 400);

  //   return () => clearTimeout(delayDebounce);
  // }, [searchQuery]);

const handlePhoneSearch = async () => {
 
    if (searchQuery.length !== 10) {
 
      toast.error("Please enter a valid 10-digit phone number");
 
      return;
 
    }
 
    try {
 
      setPhoneSearchLoading(true);
 
      const res = await api.get(`/customers/by-phone/${searchQuery}`);
 
      if (res.data.success && res.data.customerExists) {
 
        const { customer, products } = res.data.data;
 
        setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
 
        setFilteredCustomers([customer]);
 
        setCustomerProducts(products || []);
 
        handleCustomerSelect(customer);
 
      } else {
        resetCustomerData();
 
        setFilteredCustomers([]);
 
        setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
 
        toast.error("No data found for this phone number");
 
      }
 
    } catch (err) {
 
      resetCustomerData();
 
      setFilteredCustomers([]);
 
      setValues((prev) => ({ ...prev, END_TELEPHONE: searchQuery }));
 
      toast.error("No data found for this phone number");
 
    } finally {
 
      setPhoneSearchLoading(false);
 
    }
 
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const res = await api.get("/master/categories");

        if (res.data.success) {
          setCategories(res.data.data);
        } else {
          toast.error("Failed to load categories");
        }
      } catch (err) {
        console.error("Category API Error:", err);
        toast.error("Category service unavailable");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!values.CATEGORY_ID) {
        setSubCategories([]);
        return;
      }

      try {
        setSubCategoriesLoading(true);

        const res = await api.get(`/master/sub-categories/${values.CATEGORY_ID}`);

        if (res.data.success) {
          setSubCategories(res.data.data);
        } else {
          setSubCategories([]);
          toast.error("Failed to load sub categories");
        }
      } catch (err) {
        console.error("SubCategory API Error:", err);
        toast.error("Sub category service unavailable");
        setSubCategories([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    };

    fetchSubCategories();
  }, [values.CATEGORY_ID]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!values.SUB_CATEGORY_ID) {
        setModelSpecifications([]);
        return;
      }

      try {
        setModelLoading(true);

        const res = await api.get(`/master/model-specifications/${values.SUB_CATEGORY_ID}`);

        if (res.data.success) {
          setModelSpecifications(res.data.data);
        } else {
          setModelSpecifications([]);
          toast.error("Failed to load model specifications");
        }
      } catch (err) {
        console.error("Model API Error:", err);
        toast.error("Model specification service unavailable");
        setModelSpecifications([]);
      } finally {
        setModelLoading(false);
      }
    };

    fetchModels();
  }, [values.SUB_CATEGORY_ID]);

  useEffect(() => {
    const fetchCustomerModels = async () => {
      if (!values.MODEL_SPEC_ID) {
        setCustomerModels([]);
        return;
      }

      try {
        setCustomerModelLoading(true);

        const res = await api.get(`/master/customer-models/${values.MODEL_SPEC_ID}`);

        if (res.data.success) {
          setCustomerModels(res.data.data);
        } else {
          setCustomerModels([]);
          toast.error("Failed to load customer models");
        }
      } catch (err) {
        console.error("Customer Model API Error:", err);
        toast.error("Customer model service unavailable");
        setCustomerModels([]);
      } finally {
        setCustomerModelLoading(false);
      }
    };

    fetchCustomerModels();
  }, [values.MODEL_SPEC_ID]);

  useEffect(() => {
    const fetchProductIds = async () => {
      if (!values.CUSTOMER_MODEL_ID) {
        setProductIds([]);
        return;
      }

      try {
        setProductIdsLoading(true);
        const res = await api.get(`/master/product-ids/${values.CUSTOMER_MODEL_ID}`);
        if (res.data.success) {
          setProductIds(res.data.data);
        } else {
          setProductIds([]);
          toast.error("Failed to load product IDs");
        }
      } catch (err) {
        console.error("Product IDs API Error:", err);
        toast.error("Product IDs service unavailable");
        setProductIds([]);
      } finally {
        setProductIdsLoading(false);
      }
    };

    fetchProductIds();
  }, [values.CUSTOMER_MODEL_ID]);

  useEffect(() => {
    if (values.Category && customerProducts.length > 0) {
      const selectedProduct = customerProducts.find((p) => p.category === values.Category);
      if (!selectedProduct) return;

      // 🔥 Prevent re-binding if same product already selected
      // if (selectedCustomerProduct?.productId === selectedProduct.productId) {
      //   return; // do nothing
      // }
      if (selectedProduct) {
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
          PURCHASE_DATE: selectedProduct.purchaseDate?.split("T")[0],

          // 🔥 ADD THIS
          PURCHASE_CHANNEL: selectedProduct.purchaseChannel
            ? selectedProduct.purchaseChannel.toLowerCase() === "online"
              ? "Online"
              : "Offline"
            : "",

          PURCHASE_Partner: selectedProduct.purchasePartner || "",
        }));
      }
    }
  }, [values.Category, customerProducts]);

  const resetCustomerData = () => {
    // setValues(INITIAL_VALUES);
    setValues((prev) => ({
      ...INITIAL_VALUES,
      ORDER_SOURCE_CODE: prev.ORDER_SOURCE_CODE, // preserve
      ORDER_SOURCE: prev.ORDER_SOURCE, // preserve
      ORDER_SOURCE_ID: prev.ORDER_SOURCE_ID,
    }));
setExistingSrList([]);
setSelectedSrExternal("");
    setCustomerProducts([]);
    setSelectedCustomerProduct(null);
    setSubCategories([]);
    setModelSpecifications([]);
    setCustomerModels([]);
    resetProductHierarchy();
    setPincodeData({
      pincode: "",
      city: "",
      state: "",
      provinceCode: "",
      sla: "",
    });
    setTicketHistory([]);
  };

  const resetProductHierarchy = () => {
    setSelectedCustomerProduct(null);
    setValues((prev) => ({
      ...prev,
      PRODUCT_ID: "",
      customerProductId: "",
      PRODUCT_ID_HISENSE: "",
      Category: "",
      CATEGORY_ID: "",
      SUB_CATEGORY_ID: "",
      MODEL_SPEC_ID: "",
      CUSTOMER_MODEL_ID: "",
      SERIALNO: "",
      SERIALNO1: "",
      PURCHASE_DATE: "",
      PURCHASE_CHANNEL: "",
      PURCHASE_Partner: "",
    }));
    setSubCategories([]);
    setModelSpecifications([]);
    setCustomerModels([]);
    setProductIds([]);
  };

  const handleCheckWarranty = async () => {
    // Validate that required fields for the API are filled
    if (!values.CUSTOMER_MODEL || !values.PURCHASE_DATE || !values.PURCHASE_CHANNEL) {
      toast.error("Model, Purchase Date, or Channel may be empty");
      return;
    }

    try {
      setWarrantyLoading(true);

      // Map Channel: Online -> 10, Offline -> 20
      const channelCode = values.PURCHASE_CHANNEL.toLowerCase() === "online" ? 10 : 20;

      const payload = {
        MODEL: values.CUSTOMER_MODEL,
        PUR_DATE: values.PURCHASE_DATE,
        PUR_CHAN: channelCode,
      };

      const res = await api.post("/warranty/get", payload);

      if (res.data.success) {
        const { WTY_TYPE, WTY_END_DAY } = res.data.data;

        let mappedType = "";
        let shouldLock = false;

        if (WTY_TYPE === "O") {
          mappedType = "Out Warranty";
          shouldLock = true;
        } else if (WTY_TYPE === "I") {
          mappedType = "In Warranty";
          shouldLock = true;
        }

        setValues((prev) => ({
          ...prev,
          WARRANTYPE: mappedType || "Out Warranty",
          WARRANTYPEID: WTY_TYPE || "O",
          WTY_END_DAY: WTY_END_DAY || "",
        }));
        setIsWarrantyLocked(shouldLock);
        toast.success(`Warranty Verified: ${mappedType}`);
      }
    } catch (err) {
      console.error("Warranty check failed:", err);
      toast.error("System could not verify warranty. Please select manually.");
      setIsWarrantyLocked(false);
    } finally {
      setWarrantyLoading(false);
    }
  };

  // Add this useEffect to fetch Service Types on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setServiceTypesLoading(true);
        // setOrderSourceLoading(true);
        setOrderTypeLoading(true);

       const [resService, resOrderType] = await Promise.all([
        api.get("/service-type"),
        api.get("/order-type"),
      ]);

        if (resService.data.success) setServiceTypes(resService.data.data);
        if (resOrderType.data.success) setOrderTypes(resOrderType.data.data);

         const phoneFromUrl = searchParams.get("phone");
      if (phoneFromUrl) {
        fetchExistingSR(phoneFromUrl);
      }

      } catch (err) {
        console.error("Master Data Fetch Error:", err);
        toast.error("Failed to load form options");
      } finally {
        setServiceTypesLoading(false);
        setOrderSourceLoading(false);
        setOrderTypeLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  
//order source
useEffect(() => {
  const fetchOrderSources = async () => {
    try {
      setOrderSourceLoading(true);

      let url = "/order-source";

      // ✅ Pass orderType (backend handles default ZSV1)
      if (values.ORDER_TYPE_CODE) {
        url += `?orderType=${values.ORDER_TYPE_CODE}`;
      }

      const res = await api.get(url);

      if (res.data.success) {
        const sources = res.data.data;
        setOrderSources(sources);

        // 🔥 Auto-select Call Center (moved here)
        const phoneFromUrl = searchParams.get("phone");
        if (phoneFromUrl) {
          const callCenter = sources.find(
            (s) => s.source_name === "Call Center/Telephone"
          );

          if (callCenter) {
            setValues((prev) => ({
              ...prev,
              ORDER_SOURCE: callCenter.source_name,
              ORDER_SOURCE_CODE: callCenter.source_code,
              ORDER_SOURCE_ID: callCenter.id,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Order Source Fetch Error:", err);
      toast.error("Failed to load order sources");
    } finally {
      setOrderSourceLoading(false);
    }
  };

  fetchOrderSources();
}, [values.ORDER_TYPE_CODE]);

  useEffect(() => {
    const fetchSymptomsL1 = async () => {
      // Assuming category ID is stored in values.CATEGORY_ID or similar
      if (!values.CATEGORY_ID) {
        setSymptomsL1([]); // Clear symptoms if no category
        return;
      }
      const catId = values.CATEGORY_ID;
      try {
        setSymptomsLoading(true);
        const res = await api.get(`/symptom-level1?categoryId=${catId}`);
        if (res.data.success) {
          setSymptomsL1(res.data.data);
        }
      } catch (err) {
        console.error("Symptom API Error:", err);
      } finally {
        setSymptomsLoading(false);
      }
    };

    fetchSymptomsL1();
  }, [values.CATEGORY_ID]);

  useEffect(() => {
    const fetchSymptomsL2 = async () => {
      // Only fetch if a Level 1 symptom is selected
      if (!values.SYMPTOM_1_ID) {
        setSymptomsL2([]);
        return;
      }

      try {
        setSymptomsL2Loading(true);
        const res = await api.get(`/symptom-level2?symptom1Id=${values.SYMPTOM_1_ID}`);
        if (res.data.success) {
          setSymptomsL2(res.data.data);
        }
      } catch (err) {
        console.error("Symptom L2 API Error:", err);
      } finally {
        setSymptomsL2Loading(false);
      }
    };

    fetchSymptomsL2();
  }, [values.SYMPTOM_1_ID]);

  useEffect(() => {
    const fetchSections = async () => {
      if (!values.SYMPTOM_2_ID) {
        setSections([]);
        return;
      }

      try {
        setSectionsLoading(true);
        const res = await api.get(`/section?symptomL2Id=${values.SYMPTOM_2_ID}`);
        if (res.data.success) {
          setSections(res.data.data);
        }
      } catch (err) {
        console.error("Section API Error:", err);
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchSections();
  }, [values.SYMPTOM_2_ID]);

  useEffect(() => {
    const fetchDefects = async () => {
      if (!values.SECTION_ID) {
        setDefects([]);
        return;
      }

      try {
        setDefectsLoading(true);
        const res = await api.get(`/defect?sectionId=${values.SECTION_ID}`);
        if (res.data.success) {
          setDefects(res.data.data);
        }
      } catch (err) {
        console.error("Defect API Error:", err);
      } finally {
        setDefectsLoading(false);
      }
    };

    fetchDefects();
  }, [values.SECTION_ID]);

  useEffect(() => {
    const fetchRepairs = async () => {
      if (!values.DEFECT_ID) {
        setRepairs([]);
        return;
      }

      try {
        setRepairsLoading(true);
        const res = await api.get(`/repair-action?defectId=${values.DEFECT_ID}`);
        if (res.data.success) {
          setRepairs(res.data.data);
        }
      } catch (err) {
        console.error("Repair API Error:", err);
      } finally {
        setRepairsLoading(false);
      }
    };

    fetchRepairs();
  }, [values.DEFECT_ID]);

  const resetSymptomHierarchy = () => ({
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
});

  const handleChange = (e) => {
    // const { name, value } = e.target;
    const { name } = e.target;
    let { value } = e.target;
    setIsSaved(false); // re-enable Save Ticket on any field change
    // Specific validation for Alternate Contact (END_CELL_PHONE)
    if (name === "END_CELL_PHONE") {
      // 1. Remove non-numeric characters
      // 2. Slice the string to ensure it doesn't exceed 10 digits
      const validatedValue = value.replace(/[^0-9]/g, "").slice(0, 10);

      setValues((prev) => ({ ...prev, [name]: validatedValue }));
      return; // Exit to prevent the default logic below from running
    }

    if (name === "END_EMAIL") {
      const noSpaces = value.replace(/\s/g, ""); // Remove spaces
      setValues((prev) => ({ ...prev, [name]: noSpaces }));
      return;
    }

    // Logic for Order Source to store the Code
    if (name === "ORDER_SOURCE") {
      const sourceObj = orderSources.find((item) => item.source_code === value);

      setValues((prev) => ({
        ...prev,
        ORDER_SOURCE_CODE: value,
        ORDER_SOURCE: sourceObj?.source_name || "",
        ORDER_SOURCE_ID: sourceObj?.id,
      }));

      return;
    }
    if (name === "ORDER_TYPE") {
      const orderTypObj = orderTypes.find((item) => item.order_type === value);
// console.log(orderTypObj);

      setValues((prev) => ({
        ...prev,
        ORDER_TYPE_CODE: value,
        ORDER_TYPE: orderTypObj?.order_type_name || "",
        ORDER_TYPE_ID: orderTypObj?.id || "",

        ORDER_SOURCE: "",
    ORDER_SOURCE_CODE: "",
    ORDER_SOURCE_ID: "",

        STATUS: "",
        STATUS_CODE: "",
        STAGE: "",
        STAGE_CODE: "",
        CONSULTING_TYPE: "",
        CONSULTING_TYPE_CODE: "",
        CONSULTING_TYPE_ID: "",
        COMPLAINT_TYPE: "",
        COMPLAINT_TYPE_CODE: "",
        COMPLAINT_TYPE_ID: "",
        
        TICKET_STAGE: "",
        TICKET_STAGE_CODE: "",
        // Reset Section
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

        setSrMode("EXISTING");
        setSelectedSrExternal("");

      return;
    }
    // Logic for Service Type to store the Code
    // if (name === "SERVICE_TYPE") {
    //   const serviceObj = serviceTypes.find((item) => item.service_type_name === value);
    //   setValues((prev) => ({
    //     ...prev,
    //     [name]: value,
    //     SERVICE_TYPE_CODE: serviceObj ? serviceObj.service_type_code : "",
    //     SERVICE_TYPE_ID: serviceObj ? serviceObj.id : "",
    //     CONSULTING_TYPE_CODE: "",
    //     CONSULTING_TYPE: "",
    //     COMPLAINT_TYPE_CODE: "",
    //     COMPLAINT_TYPE: "",
    //     COMPLAINT_TYPE_ID: "",
    //     CONSULTING_TYPE_ID: "",
    //     // Reset Section
    //     SYMPTOM_1_CODE: "",
    //     SYMPTOM_1_ID: "",
    //     SYMPTOM_1: "",
    //     SYMPTOM_2: "",
    //     SYMPTOM_2_ID: "",
    //     SYMPTOM_2_CODE: "",
    //     SECTION: "",
    //     SECTION_ID: "",
    //     SECTION_CODE: "",
    //     DEFECT: "",
    //     DEFECT_ID: "",
    //     DEFECT_CODE: "",
    //     REPAIR: "",
    //     REPAIR_CODE: "",
    //     REPAIR_ID: "",
    //   }));
    //   return;
    // }
    if (name === "SERVICE_TYPE") {
  const serviceObj = serviceTypes.find((item) => item.service_type_name === value);

  setValues((prev) => ({
    ...prev,
    [name]: value,
    SERVICE_TYPE_CODE: serviceObj ? serviceObj.service_type_code : "",
    SERVICE_TYPE_ID: serviceObj ? serviceObj.id : "",

    // 🔥 FIX: only reset complaint when NOT escalation-new flow
    ...(prev.ORDER_TYPE_CODE === "ZWO3" && srMode === "NEW"
      ? {}
      : {
          COMPLAINT_TYPE_CODE: "",
          COMPLAINT_TYPE: "",
          COMPLAINT_TYPE_ID: "",
        }),

    CONSULTING_TYPE_CODE: "",
    CONSULTING_TYPE: "",
    CONSULTING_TYPE_ID: "",

    // reset hierarchy
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
    // Logic for Consulting Type
    if (name === "CONSULTING_TYPE") {
      const consultingObj = consultingTypes.find((item) => item.id === Number(value));

      setValues((prev) => ({
        ...prev,
        CONSULTING_TYPE_CODE: consultingObj?.code || "",
        // CONSULTING_TYPE_CODE: value,
        CONSULTING_TYPE: consultingObj?.name || "",
        CONSULTING_TYPE_ID: consultingObj?.id || "",
        COMPLAINT_TYPE_CODE: "",
        COMPLAINT_TYPE: "",
        SERVICE_TYPE: "",
        SERVICE_TYPE_CODE: "",
        SERVICE_TYPE_ID: "",
        COMPLAINT_TYPE_ID: "",
        // Reset Section
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

    // Logic for Complaint Type
    // if (name === "COMPLAINT_TYPE") {
    //   const complaintObj = complaintTypes.find((item) => item.code === value);

    //   setValues((prev) => ({
    //     ...prev,
    //     COMPLAINT_TYPE_CODE: value,
    //     COMPLAINT_TYPE: complaintObj?.name || "",
    //     COMPLAINT_TYPE_ID: complaintObj?.id || "",
    //     CONSULTING_TYPE_CODE: "",
    //     CONSULTING_TYPE: "",
    //     SERVICE_TYPE: "",
    //     SERVICE_TYPE_CODE: "",
    //     SERVICE_TYPE_ID: "",
    //     CONSULTING_TYPE_ID: "",
    //     // Reset Section
    //     SYMPTOM_1_CODE: "",
    //     SYMPTOM_1_ID: "",
    //     SYMPTOM_1: "",
    //     SYMPTOM_2: "",
    //     SYMPTOM_2_ID: "",
    //     SYMPTOM_2_CODE: "",
    //     SECTION: "",
    //     SECTION_ID: "",
    //     SECTION_CODE: "",
    //     DEFECT: "",
    //     DEFECT_ID: "",
    //     DEFECT_CODE: "",
    //     REPAIR: "",
    //     REPAIR_CODE: "",
    //     REPAIR_ID: "",
    //   }));

    //   return;
    // }

    if (name === "COMPLAINT_TYPE") {
  const complaintObj = complaintTypes.find((item) => item.code === value);

  setValues((prev) => ({
    ...prev,
    COMPLAINT_TYPE_CODE: value,
    COMPLAINT_TYPE: complaintObj?.name || "",
    COMPLAINT_TYPE_ID: complaintObj?.id || "",

    // 🔥 FIX: only reset service when NOT escalation-new flow
    ...(prev.ORDER_TYPE_CODE === "ZWO3" && srMode === "NEW"
      ? {}
      : {
          SERVICE_TYPE: "",
          SERVICE_TYPE_CODE: "",
          SERVICE_TYPE_ID: "",
        }),

    CONSULTING_TYPE_CODE: "",
    CONSULTING_TYPE: "",
    CONSULTING_TYPE_ID: "",

    // reset hierarchy
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

    // ... rest of your existing handleChange logic
    setValues((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "PURCHASE_CHANNEL") {
        updated.PURCHASE_Partner = "";
      }
      return updated;
    });

    if (name === "Category") {
      if (value === values.Category) {
        return;
      }

      const selectedCategory = categories.find((cat) => cat.name === value);

      const matchedProduct = customerProducts.find((p) => p.categoryId === selectedCategory?.id);

      setSelectedCustomerProduct(matchedProduct || null);

      setValues((prev) => ({
        ...prev,
        CATEGORY_ID: selectedCategory ? selectedCategory.id : "",
        Category: value,
        Category_Code: selectedCategory?.code,
        SUB_CATEGORY_ID: "",
        MODEL_SPEC_ID: "",
        CUSTOMER_MODEL_ID: "",
        // Reset Section
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
      const products = productIds.find((item) => Number(item.id) === Number(value));
      setValues((prev) => ({
        ...prev,
        PRODUCT_ID: value,
        PRODUCT_ID_HISENSE: products?.product_code || "",
      }));

      return;
    }

    if (name === "SYMPTOM_1") {
      const symptomObj = symptomsL1.find((item) => item.symptom_1_name === value);
      setValues((prev) => ({
        ...prev,
        [name]: value,
        SYMPTOM_1_CODE: symptomObj ? symptomObj.symptom_1_code : "",
        SYMPTOM_1_ID: symptomObj ? symptomObj.id : "",
        SYMPTOM_2: "", // Reset L2 when L1 changes
        SYMPTOM_2_CODE: "",
        SECTION: "",
        SECTION_ID: "",
        SECTION_CODE: "", // Reset Section
        DEFECT: "",
        DEFECT_ID: "",
        DEFECT_CODE: "", // Reset Defect
        REPAIR: "",
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }

    if (name === "SYMPTOM_2") {
      const symptomObj = symptomsL2.find((item) => item.symptom_2_name === value);
      setValues((prev) => ({
        ...prev,
        [name]: value,
        SYMPTOM_2_CODE: symptomObj ? symptomObj.symptom_2_code : "",
        SYMPTOM_2_ID: symptomObj ? symptomObj.id : "",
        SECTION: "", // Reset downstream field
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
        [name]: value,
        SECTION_CODE: obj ? obj.section_code : "",
        SECTION_ID: obj ? obj.id : "", // Keep for next level (Defect) if needed
        DEFECT: "", // Reset Defect when Section changes
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
        [name]: value,
        DEFECT_CODE: obj ? obj.defect_code : "",
        DEFECT_ID: obj ? obj.id : "", // Triggers Repair fetch
        REPAIR: "", // Reset downstream
        REPAIR_CODE: "",
        REPAIR_ID: "",
      }));
      return;
    }
    if (name === "REPAIR") {
      // Assuming repair response has 'repair_code' and 'repair_name' or similar
      const obj = repairs.find((item) => item.repair_code === value);
      setValues((prev) => ({
        ...prev,
        [name]: value,
        REPAIR: obj ? obj.repair_description : "",
        REPAIR_CODE: obj ? obj.repair_code : "",
        REPAIR_ID: obj ? obj.id : "",
      }));
    }

    if (name === "STATUS") {
      // Find the status object to get its unique code
      const statusObj = availableStatuses.find((s) => s.status_code === value);
      setValues((prev) => ({
        ...prev,
        STATUS: statusObj ? statusObj.status_description : "", // For display
        STATUS_CODE: value, // To trigger Stage API
        STATUS_ID: statusObj ? statusObj.id : "",
        STAGE: "", // Reset downstream
        STAGE_CODE: "",
        STAGE_ID: "",
      }));
      return;
    }

    // if (name === "STAGE") {
    //   setValues((prev) => ({
    //     ...prev,
    //     STAGE: ticketStageData ? ticketStageData.stage_label : "",
    //     STAGE_CODE: ticketStageData ? ticketStageData.stage_code : "",
    //   }));
    //   return;
    // }
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
    ];

    if (sapSanitizeFields.includes(name)) {
      value = sanitizeSapText(value);
    }
  };

  useEffect(() => {
    if (!values.CATEGORY_ID) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      if (!values.CATEGORY_ID || !selectedCustomerProduct) return;
      try {
        const res = await api.get(`/master/sub-categories/${values.CATEGORY_ID}`);

        if (res.data.success) {
          setSubCategories(res.data.data);

          // 🔥 AUTO SELECT IF MATCH EXISTS
          if (selectedCustomerProduct?.subCategoryId) {
            setValues((prev) => ({
              ...prev,
              SUB_CATEGORY_ID: selectedCustomerProduct.subCategoryId,
            }));
          }
        }
      } catch (err) {
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [values.CATEGORY_ID, selectedCustomerProduct]);

  useEffect(() => {
    if (!values.SUB_CATEGORY_ID) {
      setModelSpecifications([]);
      return;
    }

    const fetchModels = async () => {
      if (!values.SUB_CATEGORY_ID || !selectedCustomerProduct) return;
      try {
        const res = await api.get(`/master/model-specifications/${values.SUB_CATEGORY_ID}`);

        if (res.data.success) {
          setModelSpecifications(res.data.data);

          if (selectedCustomerProduct?.modelSpecificationId) {
            setValues((prev) => ({
              ...prev,
              MODEL_SPEC_ID: selectedCustomerProduct.modelSpecificationId,
            }));
          }
        }
      } catch (err) {
        setModelSpecifications([]);
      }
    };

    fetchModels();
  }, [values.SUB_CATEGORY_ID, selectedCustomerProduct]);

  useEffect(() => {
    if (!values.MODEL_SPEC_ID) {
      setCustomerModels([]);
      setProductIds([]);
      return;
    }

    const fetchCustomerModels = async () => {
      if (!values.MODEL_SPEC_ID || !selectedCustomerProduct) return;
      try {
        const res = await api.get(`/master/customer-models/${values.MODEL_SPEC_ID}`);

        if (res.data.success) {
          setCustomerModels(res.data.data);

          if (selectedCustomerProduct?.customerModelId) {
            setValues((prev) => ({
              ...prev,
              CUSTOMER_MODEL_ID: selectedCustomerProduct.customerModelId,
            }));
          }
        }
      } catch (err) {
        setCustomerModels([]);
      }
    };

    fetchCustomerModels();
  }, [values.MODEL_SPEC_ID, selectedCustomerProduct]);

  useEffect(() => {
    const fetchStatuses = async () => {
      // Only fetch if we have an Order Type Code
      if (!values.ORDER_TYPE_CODE) {
        setAvailableStatuses([]);
        return;
      }

      try {
        setStatusesLoading(true);
        // POST payload with orderTypeCode as requested
        const res = await api.post("/tickets/statuses", {
          orderType: values.ORDER_TYPE_CODE,
        });

        if (res.data.success) {
          let statuses = res.data.data;

          // 🔥 If ZSV1 → only allow E0001
          // if (values.ORDER_TYPE_CODE === "ZSV1") {
          //   statuses = statuses.filter((status) => status.status_code === "E0002");
          // }

                    if (values.ORDER_TYPE_CODE === "ZSV1") {
  statuses = statuses.filter(
    (status) =>
      status.status_code === "E0002" ||
      status.status_code === values.STATUS_CODE // keep existing status
  );
}

          setAvailableStatuses(statuses);
        }
      } catch (err) {
        console.error("Status API Error:", err);
        toast.error("Failed to load available statuses");
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, [values.ORDER_TYPE_CODE]);

  useEffect(() => {
  if (srMode === "EXISTING") {
    setValues(prev => ({
      ...prev,
      SERVICE_TYPE: "",
      SERVICE_TYPE_CODE: "",
      SERVICE_TYPE_ID: "",
    }));
  }
}, [srMode]);

useEffect(() => {
  if (values.ORDER_TYPE_CODE === "ZWO3") {
    console.log("zw03 h ye");
    console.log(existingSrList.length);
    
    if (existingSrList.length === 0) {
      setSrMode("NEW");
    }
  }
  console.log("changes h ye ");
   console.log(existingSrList.length);
   console.log("---------------------3-------------------");
   
  
}, [existingSrList]);

  useEffect(() => {
    const fetchTicketStages = async () => {
      // 🔥 ONLY fetch if Order Type is ZSV1 AND a status is selected
      if (values.ORDER_TYPE_CODE !== "ZSV1" || !values.STATUS_CODE) {
        return;
      }

      try {
        setStagesLoading(true);
        const res = await api.post("/tickets/stage", {
          statusCode: values.STATUS_CODE,
        });

        if (res.data.success && res.data.data) {
          const stage = res.data.data;

          // Auto-fill the values state with the API data
          setValues((prev) => ({
            ...prev,
            STAGE: stage.stage_label,
            STAGE_CODE: stage.stage_code,
            STAGE_ID: stage.id,
          }));
        }
      } catch (err) {
        console.error("Ticket Stage Error:", err);
      } finally {
        setStagesLoading(false);
      }
    };

    fetchTicketStages();
  }, [values.STATUS_CODE, values.ORDER_TYPE_CODE]);

  const fetchTicketHistoryByPhone = async (phone) => {
    if (!phone || phone.length !== 10) return;

    try {
      setHistoryLoading(true);

      const res = await api.get(`/tickets/recent-history?primaryPhone=${phone}`);

      if (res.data.success && Array.isArray(res.data.data)) {
        const mappedHistory = res.data.data.map((ticket) => ({
          id: ticket.id,
          order_type_name: ticket.order_type_name || "N/A",
          external_ticket_number: ticket.external_ticket_number,
          status: ticket.status_description || "Unknown",
          stage_label: ticket.stage_label || "No Stage Info",
          order_source_name: ticket.order_source_name || "N/A",
          createdAt: ticket.created_at,
        }));
        setTicketHistory(mappedHistory);
      } else {
        setTicketHistory([]);
      }
    } catch (err) {
      console.error("Ticket History Error:", err);
      setTicketHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── HCRM ID search (external) ────────────────────────────────────────────
  const handleHcrmSearch = async () => {
    if (!hcrmSearchQuery.trim()) {
      toast.error("Please enter an HCRM ID to search");
      return;
    }
    try {
      setHcrmSearchLoading(true);
      const res = await api.get(`/tickets/${hcrmSearchQuery}/details?isExternal=true`);
      if (res.data.success) {
        bindTicketData(res.data.data, {
          successMessage: `HCRM ticket ${hcrmSearchQuery} loaded successfully`,
        });
      } else {
        toast.error("No data found for this HCRM ID");
      }
    } catch (err) {
      console.error("HCRM Search Error:", err);
      toast.error("No data found for this HCRM ID");
    } finally {
      setHcrmSearchLoading(false);
    }
  };

  const handleSocialChange = (platform, value) => {
    setValues((prev) => ({
      ...prev,
      END_Socials: {
        ...prev.END_Socials,
        [platform]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.END_TELEPHONE || !/^\d{10}$/.test(values.END_TELEPHONE)) {
      toast.error("Phone number is mandatory and must be exactly 10 digits");
      return;
    }

    if (!values.END_LAST_NAME || !values.END_LAST_NAME.trim()) {
      // Mandatory Last Name
      toast.error("Last Name is mandatory");
      return;
    }

    // Mandatory Email
    // if (!values.END_EMAIL || !values.END_EMAIL.trim()) {
    //   toast.error("Email is mandatory");
    //   return;
    // }
     if (values.END_EMAIL && !validateEmail(values.END_EMAIL)) {
      toast.error("Cannot save: Invalid Email Address");
      return;
    }
 
    if (!values.END_CITY || !values.END_CITY.trim()) {
      toast.error("City is mandatory");
      return;
    }
 
    if (!values.END_PROVINCE || !values.END_PROVINCE.toString().trim()) {
      toast.error("Province is mandatory");
      return;
    }

    if (!values.END_ADDRESS1 || !values.END_ADDRESS1.trim()) {
  toast.error("Address Line 1 is mandatory");
  return;
}

   
    // --- Validation: Province must be 2 digits if zipcode is present ---
    if (values.END_ZIP_CODE) {
      const zipcode = String(values.END_ZIP_CODE).trim();

      // Zipcode must be 6 digits
      if (!/^\d{6}$/.test(zipcode)) {
        toast.error("Zipcode must be exactly 6 digits");
        return;
      }

      // Province must be 2 digits
      const province = String(values.END_PROVINCE || "").trim();
      if (!/^\d{2}$/.test(province)) {
        toast.error("Province should be a two digit number");
        return;
      }
    }

    // --- Mandatory: Order Source, Order Type ---
    if (!values.ORDER_SOURCE_ID) {
      toast.error("Order Source is mandatory");
      return;
    }
    if (!values.ORDER_TYPE_ID) {
      toast.error("Order Type is mandatory");
      return;
    }

    // --- Mandatory: type depending on Order Type ---
    if (values.ORDER_TYPE_CODE === "ZWO4" && !values.CONSULTING_TYPE_ID) {
      toast.error("Consulting Type is mandatory for this Order Type");
      return;
    }
    if (values.ORDER_TYPE_CODE === "ZWO3" && !values.COMPLAINT_TYPE_ID) {
      toast.error("Complaint Type is mandatory for this Order Type");
      return;
    }
    if (values.ORDER_TYPE_CODE === "ZSV1" && !values.SERVICE_TYPE_ID) {
      toast.error("Service Type is mandatory for this Order Type");
      return;
    }

    if (values.ORDER_TYPE_CODE === "ZWO3") {
  if (srMode === "EXISTING" && !selectedSrExternal) {
    toast.error("Select existing Service Request");
    return;
  }

    if (!values.COMPLAINT_TYPE_ID) {
    toast.error("Complaint Type is mandatory");
    return;
  }

  if (srMode === "NEW" && !values.SERVICE_TYPE_ID) {
    toast.error("Service Type is required to create SR");
    return;
  }
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

    // --- Mandatory: Status ---
    if (!values.STATUS_ID) {
      toast.error("Status is mandatory");
      return;
    }

    if (values.IS_TRANSFER === null || values.IS_TRANSFER === undefined) {
      toast.error("Is Transfer is mandatory");
      return;
    }

    // --- Mandatory: Agent Remarks (always) ---
    if (!values.agent_remarks?.trim()) {
      toast.error("Agent Remarks are mandatory");
      return;
    }

    // --- Mandatory when Category is selected: product fields ---
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

    const cleanedSocials = Object.fromEntries(
      Object.entries(values.END_Socials || {}).filter(([_, v]) => typeof v === "string" && v.trim() !== ""),
    );
    // const finalPayload = { ...values, END_Socials: cleanedSocials };
    const { IS_TRANSFER, ...rest } = values;
    const finalPayload = {
      ...rest,
      isTransferred: IS_TRANSFER, // ✅ renamed
      END_Socials: cleanedSocials,
      srMode,
      srExternalTicket: selectedSrExternal || null,
      END_EMAIL: values.END_EMAIL?.trim() ? values.END_EMAIL : "xyz@gmail.com",
    };

    // --- UPDATE flow: ticket selected from history AND IS_CONSULTING is false ---
    if (selectedTicketId && !isTransfer) {
      try {
        setLoading(true);
        await api.patch(`/tickets/${selectedTicketId}/agent-remark`, {
          agentRemark: values.agent_remarks,
          finalPayload: finalPayload,
          IS_CONSULTING: values.IS_CONSULTING,
          isL1: isL2 === false && isL3 === false,
        });
        toast.success(`Ticket #${selectedTicketId} updated successfully!`);
        setIsSaved(true);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to update ticket");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- CREATE flow: no ticket selected OR IS_CONSULTING is true ---
try {
  setLoading(true);
  await createTicket(finalPayload);
  toast.success("Ticket created successfully!");
  setIsSaved(true);
  fetchTicketHistoryByPhone(values.END_TELEPHONE);

} catch (error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 409 && data?.errorCode === "DUPLICATE_OPEN_TICKET") {
    toast.error(data.message); // 🔥 show exact backend message
  } else {
    toast.error(data?.message || "Failed to create ticket");
  }

} finally {
  setLoading(false);
}

  };

  const isSymptomSectionMandatory = () => {
    if (values.ORDER_TYPE_CODE === "ZSV1") return true;

    if (values.ORDER_TYPE_CODE === "ZWO4"  && Number(values.CONSULTING_TYPE_ID) === 2) {
      return true;
    }

    return false;
  };

  const shouldShowSymptomSection = () => {
    if (values.ORDER_TYPE_CODE === "ZSV1") return true;
    if (values.ORDER_TYPE_CODE === "ZWO3") return true;

    // const allowedConsultingCodes = ["C02", "C05", "C10", "C11", "C12"];
 const allowedConsultingIds = [2, 5, 10,12]; // example IDs
     if (values.ORDER_TYPE_CODE === "ZWO4" && allowedConsultingIds.includes(Number(values.CONSULTING_TYPE_ID))) {
      return true;
    }

    return false;
  };

  const handlePincodeChange = async (value) => {
    const validatedValue = value.replace(/[^0-9]/g, "").slice(0, 6);

    setValues((prev) => ({
      ...prev,
      END_ZIP_CODE: validatedValue,
    }));

    setPincodeData((prev) => ({
      ...prev,
      pincode: validatedValue,
    }));

    if (validatedValue.length === 6) {
      await fetchPincodeDetails(validatedValue);
    }
  };

  const fetchPincodeDetails = async (pincode) => {
    try {
      const res = await api.get(`/pincodes/${pincode}`);

      if (res.data.success) {
        const { city, state, province_code, sla } = res.data.data;

        const assignDate = calculateAssignDate(sla);

        // Update ONLY location fields
        setValues((prev) => ({
          ...prev,
          END_CITY: city,
          END_PROVINCE: province_code,
          ASSIGN_DATE: isTicketReadOnly ? prev.ASSIGN_DATE : assignDate,
        }));

        setPincodeData((prev) => ({
          ...prev,
          city,
          state,
          provinceCode: province_code,
          sla,
          assignDate,
        }));
      } else {
        toast.error("Invalid Pincode");
      }
    } catch (err) {
      console.error("Failed to fetch pincode data", err);
      toast.error("Pincode service unavailable");
    }
  };

  // Fetch Consulting Types only when ORDER_TYPE_CODE is ZW04
  useEffect(() => {
    const fetchConsulting = async () => {
      if (values.ORDER_TYPE_CODE !== "ZWO4") {
        setConsultingTypes([]);
        return;
      }
      try {
        const res = await api.get("/masters-orders/consulting-types");
        if (res.data.success) setConsultingTypes(res.data.data);
      } catch (err) {
        console.error("Consulting Type Fetch Error:", err);
      }
    };
    fetchConsulting();
  }, [values.ORDER_TYPE_CODE]);

  // Fetch Complaint Types only when ORDER_TYPE_CODE is ZW03
  useEffect(() => {
    const fetchComplaints = async () => {
      if (values.ORDER_TYPE_CODE !== "ZWO3") {
        setComplaintTypes([]);
        return;
      }
      try {
        const res = await api.get("/masters-orders/complaint-types");
        if (res.data.success) setComplaintTypes(res.data.data);
      } catch (err) {
        console.error("Complaint Type Fetch Error:", err);
      }
    };
    fetchComplaints();
  }, [values.ORDER_TYPE_CODE]);

  const calculateAssignDate = (sla) => {
    if (!sla) return "";

    const match = sla.match(/\+(\d+)/); // Extract number after +
    const daysToAdd = match ? parseInt(match[1], 10) : 0;

    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);

    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const socialPlatforms = [
    { key: "x", label: "X", prefix: "@" },
    { key: "facebook", label: "Facebook", prefix: "" },
    { key: "linkedin", label: "LinkedIn", prefix: "in/" },
    { key: "instagram", label: "Instagram", prefix: "@" },
    { key: "youtube", label: "YouTube", prefix: "" },
  ];

  const searchModelNumber = async () => {
  if (!modelSearch.trim()) {
    toast.error("Enter model number");
    return;
  }
 
  try {
    setModelSearchLoading(true);
 
    const res = await api.get(`/tickets/customer-model/search/${modelSearch}`);
 
    if (res.data.success) {
      const data = res.data.data;
 
      setValues((prev) => ({
        ...prev,
        Category: data.category,
        CATEGORY_ID: data.categoryId,
        Category_Code: data.categoryCode,
        SUB_CATEGORY_ID: data.subCategoryId,
        MODEL_SPEC_ID: data.modelSpecId,
        CUSTOMER_MODEL_ID: data.customerModelId,
        CUSTOMER_MODEL: data.model_number,
 
         ...resetSymptomHierarchy(),   // 🔥 reset here
      }));
 
      toast.success("Model found");
    } else {
      toast.error("Model not found");
    }
 
  } catch (err) {
    console.error("Model search error:", err);
    toast.error("Search failed");
  } finally {
    setModelSearchLoading(false);
  }
};


useEffect(() => {
  if (!values.STATUS_CODE || availableStatuses.length === 0) return;
 
  const exists = availableStatuses.find(
    (s) => s.status_code === values.STATUS_CODE
  );
 
  if (!exists) return;
 
  setValues((prev) => {
    if (
      prev.STATUS_ID === exists.id &&
      prev.STATUS === exists.status_description
    ) {
      return prev;
    }
 
    return {
      ...prev,
      STATUS: exists.status_description,
      STATUS_ID: exists.id,
    };
  });
}, [availableStatuses]);

 const groupedHistory = {
    "Service Request": ticketHistory.filter(t => t.order_type_name === "Service Request"),
    "Consulting": ticketHistory.filter(t => t.order_type_name === "Consulting"),
    "Complaint": ticketHistory.filter(t => t.order_type_name === "Escalation"),
  };

useEffect(() => {
  if (isTransfer) {
    setValues((prev) => ({
      ...prev,
      IS_TRANSFER: false,
    }));
  }
}, [isTransfer]);


  return (
    <div className="bg-linear-to-br from-gray-50 to-blue-50">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-1.5">
        <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg">
          <h3 className="text-l font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-800">Create Ticket</h3>
          {isTicketReadOnly && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Viewing Ticket #{selectedTicketId} — Agent Remarks editable only
            </span>
          )}
          <div className="col-span-2">
            {/* <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">HCRM Search</label> */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Enter HCRM ID..."
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                value={hcrmSearchQuery}
                onChange={(e) => setHcrmSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleHcrmSearch())}
              />
              <button
                type="button"
                onClick={handleHcrmSearch}
                disabled={hcrmSearchLoading}
                className={`px-2 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap ${
                  hcrmSearchLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {hcrmSearchLoading ? <CircularProgress size={12} color="inherit" /> : <Search size={12} />}
                {hcrmSearchLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
          {/* COLUMN 1 */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={User} title="Customer Information" />
            <div className="relative">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                Primary Contact No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
 
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter phone number..."
                  maxLength={10}
                  className="w-full pl-10 pr-20 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setSearchQuery(value);
                    resetCustomerData();
                    setSelectedCustomerProduct(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePhoneSearch())}
                />
                  <button
                  type="button"
                  onClick={handlePhoneSearch}
                  disabled={phoneSearchLoading}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-white rounded transition-colors flex items-center gap-1 ${phoneSearchLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                  {phoneSearchLoading ? <CircularProgress size={12} color="inherit" /> : <Search size={12} />}
                  {phoneSearchLoading ? "..." : ""}
                </button>

                {/* <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /> */}
              </div>
              {showSearchResults && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.customerCode}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="font-semibold text-sm text-gray-800">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-gray-600">{customer.primaryPhone}</div>
                    </div>
                  ))}
                </div>
              )}
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
                disabled={isTicketReadOnly}
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
                  disabled={isTicketReadOnly}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                label="First Name"
                name="END_FIRST_NAME"
                value={values.END_FIRST_NAME}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
              />
              <FormField
                label="Last Name"
                name="END_LAST_NAME"
                value={values.END_LAST_NAME}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
                required
              />
            </div>

            {/* <FormField
              label="Email Address"
              onBlur={(e) => {
                if (e.target.value && !validateEmail(e.target.value)) {
                  toast.error("Please enter a valid email address");
                }
              }}
              name="END_EMAIL"
              type="email"
              value={values.END_EMAIL}
              onChange={handleChange}
              readOnly={isTicketReadOnly}
              required
            /> */}
            <FormField
              label="Email Address"
              onBlur={(e) => {
                if (e.target.value && !validateEmail(e.target.value)) {
                  toast.error("Please enter a valid email address");
                }
              }}
              name="END_EMAIL"
              type="email"
              value={values.END_EMAIL}
              onChange={handleChange}
              readOnly={isTicketReadOnly}
 
            />
            <FormField
              label="Alternate Contact"
              name="END_CELL_PHONE"
              value={values.END_CELL_PHONE}
              onChange={handleChange}
              readOnly={isTicketReadOnly}
            />
            <FormField
              label="Company Name"
              name="END_COMP_NAME"
              value={values.END_COMP_NAME}
              onChange={handleChange}
              readOnly={isTicketReadOnly}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Country" name="END_COUNTRY" disabled value={values.END_COUNTRY} onChange={handleChange} />
              <FormField
                label="Pincode"
                name="END_ZIP_CODE"
                required
                value={pincodeData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                readOnly={isTicketReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="City" name="END_CITY" value={pincodeData.city} onChange={handleChange} readOnly={isTicketReadOnly} required/>
              <FormField label="Province" name="END_PROVINCE" value={pincodeData.provinceCode} onChange={handleChange} readOnly={true} required/>
            </div>

            <div className="space-y-2">
              <FormField
                label="Address Line 1"
                name="END_ADDRESS1"
                value={values.END_ADDRESS1}
                 onChange={(e) => {
                  if (e.target.value.length <= 60) handleChange(e);
                }}
                readOnly={isTicketReadOnly}
                required
              />
               <div className="flex justify-between items-center mt-0.5">
                {values.END_ADDRESS1?.length >= 60 && (
                  <span className="text-red-500 text-[10px] font-medium">
                    Maximum 60 characters allowed
                  </span>
                )}
 
                <span
                  className={`ml-auto text-[10px] ${values.END_ADDRESS1?.length >= 60
                    ? "text-red-500 font-semibold"
                    : "text-gray-400"
                    }`}
                >
                  {values.END_ADDRESS1?.length || 0}/60
                </span>
              </div>
              <FormField
                label="Address Line 2"
                name="END_ADDRESS2"
                value={values.END_ADDRESS2}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
              />
              <FormField
                label="Address Line 3"
                name="END_ADDRESS3"
                value={values.END_ADDRESS3}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
              />
            </div>

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

          {/* COLUMN 2 */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={Package} title="Product Information" />
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Customer ID" name="CUSTOMER_ID" disabled value={values?.CUSTOMER_ID} onChange={handleChange} />
              <FormField label="Product ID" name="PRODUCT_ID" disabled value={values.PRODUCT_ID} onChange={handleChange} />
            </div>

             <div className="relative flex items-center">
    <input
      type="text"
      placeholder="Enter model number..."
      className="w-full px-2.5 pr-16 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 outline-none"
      value={modelSearch}
      onChange={(e) => setModelSearch(e.target.value.toUpperCase())}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          searchModelNumber();
        }
      }}
    />
 
    {/* Clear button */}
    {modelSearch && (
      <button
        type="button"
        onClick={() => {
          setModelSearch("");
 
          setValues((prev) => ({
            ...prev,
            Category: "",
            CATEGORY_ID: "",
            SUB_CATEGORY_ID: "",
            MODEL_SPEC_ID: "",
            CUSTOMER_MODEL_ID: "",
            CUSTOMER_MODEL: "",
          }));
        }}
        className="absolute right-10 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    )}
 
    {/* Search button */}
    <button
      type="button"
      onClick={searchModelNumber}
      disabled={modelSearchLoading}
      className={`absolute right-1 px-2 py-1 text-xs font-semibold text-white rounded flex items-center gap-1
        ${modelSearchLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
      `}
    >
      {modelSearchLoading ? (
        <CircularProgress size={12} color="inherit" />
      ) : (
        <Search size={12} />
      )}
    </button>
  </div>

            <CategorySelectField
              label="Category"
              name="Category"
              customerProducts={isTicketReadOnly ? undefined : [...new Set(customerProducts.map((p) => p.category))]}
              allProducts={categories.map((cat) => cat.name)}
              // required
              value={values.Category}
              onChange={handleChange}
              disabled={categoriesLoading || isTicketReadOnly}
            />
            <FormField
              label="Sub Category"
              name="SubCategory"
              type="select"
              options={subCategories.map((sub) => ({
                label: sub.name,
                value: sub.id,
              }))}
              required={!!values.CATEGORY_ID}
              disabled={!values.CATEGORY_ID || subCategoriesLoading || isTicketReadOnly}
              value={values.SUB_CATEGORY_ID || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedObj = subCategories.find((sub) => sub.id === Number(selectedId));

                setValues((prev) => ({
                  ...prev,
                  SUB_CATEGORY_ID: selectedId,
                  subCategory: selectedObj ? selectedObj.name : "",
                }));
              }}
            />
            <FormField
              label="Model Specification"
              name="MODEL_SPEC_ID"
              type="select"
              options={modelSpecifications.map((model) => ({
                label: model.spec_value,
                value: model.id,
              }))}
              required={!!values.CATEGORY_ID}
              disabled={!values.SUB_CATEGORY_ID || modelLoading || isTicketReadOnly}
              value={values.MODEL_SPEC_ID || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedObj = modelSpecifications.find((m) => m.id === Number(selectedId));

                setValues((prev) => ({
                  ...prev,
                  MODEL_SPEC_ID: selectedId,
                  modelSpecification: selectedObj ? selectedObj.spec_value : "",
                }));
              }}
            />
            <FormField
              label="Customer Model"
              name="CUSTOMER_MODEL_ID"
              type="select"
              options={customerModels.map((model) => ({
                label: model.model_number,
                value: model.id,
              }))}
              required={!!values.CATEGORY_ID}
              disabled={!values.MODEL_SPEC_ID || customerModelLoading || isTicketReadOnly}
              value={values.CUSTOMER_MODEL_ID || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedObj = customerModels.find((m) => m.id === Number(selectedId));

                setValues((prev) => ({
                  ...prev,
                  CUSTOMER_MODEL_ID: selectedId,
                  CUSTOMER_MODEL: selectedObj ? selectedObj.model_number : "",
                  PRODUCT_ID: "",
                }));
                setProductIds([]);
              }}
            />
            <FormField
              label="Product ID"
              name="PRODUCT_IDS_ID"
              type="select"
              options={productIds.map((item) => ({
                label: item.product_code,
                value: item.id,
              }))}
              disabled={!values.CUSTOMER_MODEL_ID || productIdsLoading || isTicketReadOnly}
              value={values.PRODUCT_ID || ""}
              onChange={handleChange}
              required={!!values.CATEGORY_ID}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Serial No" name="SERIALNO" value={values.SERIALNO} onChange={handleChange} readOnly={isTicketReadOnly} />
              <FormField
                label="Serial No 1"
                name="SERIALNO1"
                value={values.SERIALNO1}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
              />
            </div>

            <FormField
              label="Purchase Date"
              name="PURCHASE_DATE"
              type="date"
              required={!!values.CATEGORY_ID}
              value={values.PURCHASE_DATE}
              onChange={handleChange}
              readOnly={isTicketReadOnly}
              max={new Date().toISOString().split("T")[0]}
            />
            <FormField
              label="Purchase Channel"
              name="PURCHASE_CHANNEL"
              type="select"
              options={["Online", "Offline"]}
              required={!!values.CATEGORY_ID}
              value={values.PURCHASE_CHANNEL}
              onChange={handleChange}
              disabled={isTicketReadOnly}
            />
            {values.PURCHASE_CHANNEL === "Online" ? (
              <FormField
                label="Purchase Partner"
                name="PURCHASE_Partner"
                type="select"
                options={["Amazon", "Flipkart", "Others"]}
                value={values.PURCHASE_Partner}
                onChange={handleChange}
                disabled={isTicketReadOnly}
                required={!!values.CATEGORY_ID}
              />
            ) : values.PURCHASE_CHANNEL === "Offline" ? (
              <FormField
                label="Purchase Partner"
                name="PURCHASE_Partner"
                value={values.PURCHASE_Partner}
                onChange={handleChange}
                readOnly={isTicketReadOnly}
                required={!!values.CATEGORY_ID}
              />
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
                    required={!!values.CATEGORY_ID}
                    disabled={isTicketReadOnly}
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

                {!isTicketReadOnly && (
                  <button
                    type="button"
                    onClick={handleCheckWarranty}
                    disabled={warrantyLoading || values.VOID_WARRANTY}
                    className={`px-1.5 py-2 text-xs cursor-pointer font-semibold text-white rounded transition-colors ${
                      warrantyLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {warrantyLoading ? "Checking..." : "Check Warranty"}
                  </button>
                )}
              </div>

              {/* Display the end date and Void option */}
              {/* {values.WTY_END_DAY && (
                <span className="text-[10px] text-blue-600 font-bold italic">Warranty Valid Until: {values.WTY_END_DAY}</span>
              )} */}

              {!isTicketReadOnly && (
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
              )}
            </div>
          </div>

          {/* COLUMN 3 */}
          <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg space-y-3">
            <SectionHeader icon={Headphones} title="Agent Input" />
            <div className="grid grid-cols-2 gap-2">
              <FormField label="HCRM ID" name="HCRM_ID" disabled value={values?.externalTicketNumber} onChange={handleChange} />
               <FormField
                label="Order Type"
                name="ORDER_TYPE"
                type="select"
                options={orderTypes.map((item) => ({
                  label: item.order_type_name,
                  value: item.order_type, // Using code as value to fix duplicate key issues
                }))}
                required
                disabled={orderTypeLoading || isTicketReadOnly}
                value={values.ORDER_TYPE_CODE}
                onChange={handleChange}
              />
              <FormField
                label="Order Source"
                name="ORDER_SOURCE"
                type="select"
                options={orderSources.map((item) => ({
                  label: item.source_name,
                  value: item.source_code, // Using code as value to fix duplicate key issues
                }))}
                required
                disabled={orderSourceLoading || !!searchParams.get("phone") || isTicketReadOnly}
                value={values.ORDER_SOURCE_CODE}
                onChange={handleChange}
              />
             
              
              {(isL2 || isL3) && (
                <div className="col-span-2 flex items-center gap-2 px-1 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="IS_CONSULTING"
                    name="IS_CONSULTING"
                    checked={!!values.IS_CONSULTING}
                    onChange={(e) => {
                      setIsSaved(false);
                      setValues((prev) => ({ ...prev, IS_CONSULTING: e.target.checked }));
                    }}
                    className="h-3.5 w-3.5 accent-amber-600 cursor-pointer"
                  />
                  <label htmlFor="IS_CONSULTING" className="text-[11px] font-medium text-amber-800 cursor-pointer select-none">
                    Is Consulting
                  </label>
                </div>
              )}
              {values.ORDER_TYPE_CODE === "ZWO4" && (
                <FormField
                  label="Consulting Type"
                  name="CONSULTING_TYPE"
                  type="select"
                  options={consultingTypes.map((item) => ({
                     label: item.name,   // label unchanged
                     value: item.id      // use unique id
                  }))}
                  value={values.CONSULTING_TYPE_ID}
                  onChange={handleChange}
                  disabled={isTicketReadOnly}
                  required
                />
              )}
              {values.ORDER_TYPE_CODE === "ZWO3" && (
                <FormField
                  label="Complaint Type"
                  name="COMPLAINT_TYPE"
                  type="select"
                  options={complaintTypes.map((item) => ({
                    label: item.name,
                    value: item.code,
                  }))}
                  value={values.COMPLAINT_TYPE_CODE}
                  onChange={handleChange}
                  disabled={isTicketReadOnly}
                  required
                />
              )}
              {values.ORDER_TYPE_CODE === "ZSV1" && (
                <>
                  <FormField
                    label="Service Type"
                    name="SERVICE_TYPE"
                    type="select"
                  options={filteredServiceTypes.map((item) => item.service_type_name)}
                    required
                    disabled={serviceTypesLoading || isTicketReadOnly}
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
                  <FormField
                    label="Service Provider Number "
                    name="SP_ORDER"
                    type="text"
                    disabled
                    value={values.spOrderNumber}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
              {values.ORDER_TYPE_CODE === "ZWO3" && (
  <div className="space-y-2">
    
    <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block">
      Service Request <span className="text-red-500">*</span>
    </label>

    {/* RADIO */}
    <div className="flex gap-3">
      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
        <input
          type="radio"
          className="accent-blue-600"
          value="EXISTING"
          checked={srMode === "EXISTING"}
          onChange={() => setSrMode("EXISTING")}
        />
        Existing
      </label>

      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
        <input
          type="radio"
          className="accent-blue-600"
          value="NEW"
          checked={srMode === "NEW"}
          onChange={() => setSrMode("NEW")}
        />
        New
      </label>
    </div>

    {/* EXISTING SR DROPDOWN */}
    {srMode === "EXISTING" && (
      <div>
        <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block mb-1">
          Select Service Request
        </label>

        <select
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs 
                     focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
          value={selectedSrExternal}
          onChange={(e) => setSelectedSrExternal(e.target.value)}
        >
          <option value="">Select SR</option>
          {existingSrList.map((sr) => (
            <option
              key={sr.external_ticket_number}
              value={sr.external_ticket_number}
            >
              {sr.external_ticket_number}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* NEW SR → SERVICE TYPE (reuse FormField) */}
    {srMode === "NEW" && (
      <FormField
        label="Service Type"
        name="SERVICE_TYPE"
        type="select"
        options={serviceTypes.map((s) => ({
          label: s.service_type_name,
          value: s.service_type_name,
        }))}
        value={values.SERVICE_TYPE}
        onChange={handleChange}
        required
        disabled={srMode !== "NEW"}
      />
    )}
    {srMode === "EXISTING" && existingSrList.length === 0 && (
  <p className="text-[10px] text-red-500">
    No Service Request found for this customer {existingSrList.length}
  </p>
) }
  </div>
)}

            </div>
            {shouldShowSymptomSection() && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="Symptom 1"
                    name="SYMPTOM_1"
                    type="select"
                    options={symptomsL1.map((item) => item.symptom_1_name)}
                    required={isSymptomSectionMandatory()}
                    disabled={symptomsLoading || isTicketReadOnly}
                    value={values.SYMPTOM_1}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Symptom 2"
                    name="SYMPTOM_2"
                    type="select"
                    options={symptomsL2.map((item) => item.symptom_2_name)}
                    disabled={symptomsL2Loading || !values.SYMPTOM_1 || isTicketReadOnly}
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
                  disabled={sectionsLoading || !values.SYMPTOM_2 || isTicketReadOnly}
                  value={values.SECTION}
                  onChange={handleChange}
                />
                <FormField
                  label="Defect Description"
                  name="DEFECT"
                  type="select"
                  options={defects.map((item) => item.defect_description)}
                  disabled={defectsLoading || !values.SECTION || isTicketReadOnly}
                  value={values.DEFECT}
                  onChange={handleChange}
                />
                <FormField
                  label="Repair Description"
                  name="REPAIR"
                  type="select"
                  options={repairs.map((s) => ({
                    label: s.repair_description,
                    value: s.repair_code,
                  }))}
                  disabled={repairsLoading || !values.DEFECT || isTicketReadOnly}
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
                  disabled={isTicketReadOnly}
                />
              </>
            )}

            <FormField
              label="Status"
              name="STATUS"
              type="select"
              options={availableStatuses.map((s) => ({
                label: s.status_description,
                value: s.status_code,
              }))}
              value={values.STATUS_CODE}
              disabled={statusesLoading || !values.ORDER_TYPE_CODE || isTicketReadOnly}
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

            <FormField
              label="Is Transfer"
              name="IS_TRANSFER"
              type="select"
              required
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
              value={values.IS_TRANSFER === null ? "" : String(values.IS_TRANSFER)}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  IS_TRANSFER: e.target.value === "true"
                }))
              }
             disabled={isTicketReadOnly || isTransfer}
            />
            {(isL2 || isL3) && (
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  Follow Up Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="FOLLOW_UP_DATETIME"
                  value={values.FOLLOW_UP_DATETIME}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-lg space-y-2">
          {/* Problem Note: readonly when ticket selected */}
         <FormField
    label="Problem Description"
    name="problem_note"
    type="textarea"
    value={values.problem_note}
    onChange={(e) => {
      if (e.target.value.length <= 40) handleChange(e);
    }}
    readOnly={isTicketReadOnly}
  />
  <div className="flex justify-between items-center mt-0.5">
    {values.problem_note?.length >= 40 && (
      <span className="text-red-500 text-[10px] font-medium">
        Maximum 40 characters allowed
      </span>
    )}
    <span className={`ml-auto text-[10px] ${values.problem_note?.length >= 40 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
      {values.problem_note?.length || 0}/40
    </span>
  </div>

          {/* Agent Remarks: always editable */}
          <FormField
            label="Agent Remarks"
            name="agent_remarks"
            required
            type="textarea"
            value={values.agent_remarks}
            onChange={handleChange}
          />
        </div>
        {/* Ticket History Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Recent Ticket History</span>
            </div>
            <span className="text-xs text-gray-400">Last 5 per type</span>
          </div>

          {historyLoading ? (
            <div className="flex justify-center items-center py-6">
              <CircularProgress size={22} />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {[
                { label: "Service Request", key: "Service Request" },
                { label: "Consulting", key: "Consulting" },
                { label: "Complaint", key: "Complaint" },
              ].map(({ label, key }, sectionIdx) => {
                const tickets = groupedHistory[key] || [];
                const isExpanded = expandedSection === key;

                return (
                  <div key={key}>
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedSection(isExpanded ? null : key)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-xs font-semibold text-gray-700">
                        {sectionIdx + 1}. {label}
                        <span className="ml-2 text-gray-400 font-normal">({tickets.length})</span>
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {tickets.length === 0 ? (
                          <div className="text-center py-5 text-gray-400 text-xs bg-gray-50">
                            No {label} tickets found
                          </div>
                        ) : (
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide w-6"></th>
                                  <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Ticket Type</th>
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Ticket ID</th>

                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">HCRM ID</th>
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Created By</th>
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Created At</th>
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Status</th>
                                <th className="px-3 py-1.5 text-left font-medium text-[10px] text-gray-400 uppercase tracking-wide">Stage</th>
                                <th className="px-3 py-1.5 text-center font-medium text-[10px] text-gray-400 uppercase tracking-wide"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {tickets.map((ticket) => {
                                const isOpen =
                                  allowedStatuses.includes(ticket.status?.trim().toLowerCase()) &&
                                  ticket.order_type_name === "Service Request";
                                const isSelected = Number(selectedTicketId) === Number(ticket.id);

                                return (
                                  <>
                                    <tr
                                      key={ticket.id}
                                      className={`transition-colors duration-100 ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                    >
                                      {/* Radio */}
                                      <td className="px-3 py-1">
                                        <input
                                          type="radio"
                                          name="selectedTicket"
                                          disabled={!isOpen}
                                          checked={isSelected}
                                          onChange={() => handleSelectTicket(ticket)}
                                          className={`h-3.5 w-3.5 ${isOpen ? "cursor-pointer accent-blue-600" : "cursor-not-allowed opacity-30"}`}
                                        />
                                      </td>
                                       
                                          <td className="px-3 py-1 text-gray-500">{ticket.order_type_name || "—"}</td>
                                      {/* Ticket ID */}
                                      <td className="px-3 py-1 text-gray-500 font-mono">#{ticket.id}</td>

                                      {/* HCRM ID */}
                                      <td className="px-3 py-1 text-gray-500">{ticket.external_ticket_number || "—"}</td>

                                      {/* Created By */}
                                      <td className="px-3 py-1 text-gray-500 whitespace-nowrap">{ticket.order_source_name}</td>

                                      {/* Created At */}
                                      <td className="px-3 py-1 text-gray-500 whitespace-nowrap">{convertUTCToIST(ticket.createdAt)}</td>

                                      {/* Status */}
                                      <td className="px-3 py-1">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold leading-none ${ticket.status?.toLowerCase() === "complete"
                                              ? "bg-emerald-50 text-emerald-700"
                                              : ticket.status?.toLowerCase() === "open"
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                          {ticket.status}
                                        </span>
                                      </td>

                                      {/* Stage */}
                                      <td className="px-3 py-1 text-gray-500 max-w-[140px] truncate" title={ticket.stage_label}>
                                        {ticket.stage_label || "—"}
                                      </td>

                                      {/* View */}
                                      <td className="px-3 py-1 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleViewTicket(ticket)}
                                          className={`px-2.5 py-1 text-[10px] cursor-pointer font-medium rounded transition-colors ${expandedTimeline === ticket.id
                                              ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                                              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        >
                                          {expandedTimeline === ticket.id ? "Hide" : "View"}
                                        </button>
                                      </td>
                                    </tr>

                                    {/* Timeline Expand Row */}
                                    {expandedTimeline === ticket.id && (
                                      <tr key={`timeline-${ticket.id}`}>
                                        <td colSpan={8} className="px-0 py-0 bg-slate-50 border-b border-gray-100">
                                          {timelineLoading && !timelineData[ticket.id] ? (
                                            <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
                                              <CircularProgress size={14} /> Loading timeline...
                                            </div>
                                          ) : !timelineData[ticket.id] || timelineData[ticket.id].length === 0 ? (
                                            <div className="px-4 py-3 text-xs text-gray-400 italic">No timeline events found.</div>
                                          ) : (
                                            <div className="px-4 py-1">
                                              <table className="w-full text-[11px]">
                                                <thead>
                                                  <tr className="border-b border-slate-200">
                                                    <th className="py-1 pr-2 text-left font-semibold text-gray-500 w-8">#</th>
                                                    <th className="py-1 pr-2 text-left font-semibold text-gray-500">Remark</th>
                                                    <th className="py-1 pr-2 text-left font-semibold text-gray-500">Created By</th>
                                                    <th className="py-1 text-left font-semibold text-gray-500">Date & Time</th>
                                                    <th className="py-1 text-left font-semibold text-gray-500">Status</th>
                                                    <th className="py-1 text-left font-semibold text-gray-500">Stage</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                  {timelineData[ticket.id].map((entry, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-100 transition-colors">
                                                      <td className="py-1 pr-2 text-gray-400 font-mono">{idx + 1}</td>
                                                      <td className="py-1 text-gray-600 max-w-xs">{entry.remarks || "—"}</td>
                                                      <td className="py-1 pr-2 text-gray-600 whitespace-nowrap">{entry.changed_by_name || "—"}</td>
                                                      <td className="py-1 pr-2 text-gray-500 whitespace-nowrap font-mono">
                                                        {entry.changed_at ? convertUTCToIST(entry.changed_at) : "—"}
                                                      </td>
                                                      <td className="py-1 pr-2 text-gray-600 whitespace-nowrap">{entry.status_description || "—"}</td>
                                                      <td className="py-1 pr-2 text-gray-600 whitespace-nowrap">{entry.stage_label || "—"}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {selectedTicketId && ticketDetailsLoading && (
            <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
              <CircularProgress size={10} color="inherit" /> Loading...
            </div>
          )}
        </div>

        <div className="flex justify-end items-center bg-white p-2.5 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex gap-3">
            {isL2 || isL3 ? null : (
              <SecondaryButton onClick={clearTicketSelection} type="button">
                Reset
              </SecondaryButton>
            )}
            {/* <SecondaryButton onClick={() => navigate(-1)} type="button">
              Discard
            </SecondaryButton> */}
          <PrimaryButton type="submit" disabled={loading || isSaved}>
  {loading ? (
    <CircularProgress size={17} color="inherit" />
  ) : (
    <>
      <Save size={17} className="mr-2" />
      {selectedTicketId && !values.IS_CONSULTING && !isTransfer
        ? "Update Ticket"
        : "Save Ticket"}
    </>
  )}
</PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}
