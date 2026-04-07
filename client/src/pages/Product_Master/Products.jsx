import { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Switch,
} from "@mui/material";
import {
  Pencil,
  Search,
  Tag,
  CheckCircle,
  X,
  PlusCircle,
  Hash,
  Layers,
  Cpu,
  Package,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { sanitizeInput } from "../../utils/SanitizeInput";
import Select from "react-select";

const TextFieldCss = {
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#3b82f6" },
  },
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#1c2649" : "#d1d5db",
    boxShadow: "none",
    "&:hover": { borderColor: "#1c2649" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1c2649"
      : state.isFocused
        ? "#e6e9f2"
        : "white",
    color: state.isSelected ? "white" : "black",
    cursor: "pointer",
  }),
  dropdownIndicator: (base) => ({ ...base, padding: "4px" }),
  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [modelSpecs, setModelSpecs] = useState([]);
  const [customerModels, setCustomerModels] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedModelSpec, setSelectedModelSpec] = useState("");
  const [selectedCustomerModel, setSelectedCustomerModel] = useState("");

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    categoryId: "",
    subCategoryId: "",
    modelSpecId: "",
    customerModelId: "",
    status: "ACTIVE",
  });

  // ---------- Fetch helpers ----------

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/product-master/");
      setCategories(data);
      if (data.length > 0) setSelectedCategory(data[0].id);
    } catch {
      toast.error("Failed to load categories");
    }
  }, []);

  const fetchSubCategories = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const res = await api.get(`/pro-mst/sub/get-sub`, {
        params: { category_id: selectedCategory },
      });

      const formatted = res.data.data.map((item) => ({
        ...item,
        categoryId: item.category_id,
      }));

      setSubCategories(formatted);
      setSelectedSubCategory("");
    } catch (error) {
      toast.error("Failed to load sub-categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchModelSpecs = useCallback(async () => {
    if (!selectedSubCategory) return;
    try {
      const res = await api.get(`/modspec/get-modspec`, {
        params: { sub_category_id: selectedSubCategory },
      });

      const formatted = res.data.data.map((item) => ({
        ...item,
        name: item.spec_value,
        subCategoryId: item.sub_category_id,
      }));

      setModelSpecs(formatted);
      setSelectedModelSpec("");
    } catch {
      toast.error("Failed to load model specs");
    }
  }, [selectedSubCategory]);

  const fetchCustomerModels = useCallback(async () => {
    if (!selectedModelSpec) return;
    try {
      const res = await api.get(`/customer-models/get-cm`, {
        params: { model_spec_id: selectedModelSpec },
      });

      const formatted = res.data.data.map((item) => ({
        ...item,
        name: item.model_number,
        modelSpecId: item.model_spec_id,
      }));

      setCustomerModels(formatted);
      setSelectedCustomerModel("");
    } catch {
      toast.error("Failed to load customer models");
    }
  }, [selectedModelSpec]);

  const fetchProducts = useCallback(async () => {
    if (!selectedCustomerModel) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/get-prod`, {
        params: { customer_model_id: selectedCustomerModel },
      });

      const formatted = res.data.data.map((item) => ({
        ...item,
        name: item.product_code,        // DB has no product_name, use product_code as display
        code: item.product_code,
        customerModelId: item.customer_model_id,
      }));

      setProducts(formatted);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedCustomerModel]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchSubCategories(); }, [fetchSubCategories]);
  useEffect(() => { fetchModelSpecs(); }, [fetchModelSpecs]);
  useEffect(() => { fetchCustomerModels(); }, [fetchCustomerModels]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ---------- Derived ----------

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

 const getCategoryName = (id) =>
  categories.find((c) => String(c.id) === String(id))?.name || "—";
  const getSubCategoryName = (id) =>
    subCategories.find((s) => s.id === id)?.name || "—";
  const getModelSpecName = (id) =>
    modelSpecs.find((s) => s.id === id)?.name || "—";
  const getCustomerModelName = (id) =>
    customerModels.find((m) => m.id === id)?.name || "—";

  // ---------- Dialog helpers ----------

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setFormData({
        id: product.id,
        name: product.name || "",
        code: product.code || "",
        categoryId: product.categoryId || selectedCategory,
        subCategoryId: product.subCategoryId || selectedSubCategory,
        modelSpecId: product.modelSpecId || selectedModelSpec,
        customerModelId: product.customerModelId || selectedCustomerModel,
        status: product.status || "ACTIVE",
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        code: "",
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory,
        modelSpecId: selectedModelSpec,
        customerModelId: selectedCustomerModel,
        status: "ACTIVE",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      id: null,
      name: "",
      code: "",
      categoryId: selectedCategory,
      subCategoryId: selectedSubCategory,
      modelSpecId: selectedModelSpec,
      customerModelId: selectedCustomerModel,
      status: "ACTIVE",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) { toast.error("Product code is required"); return; }
    if (!formData.customerModelId) { toast.error("Please select a customer model"); return; }

    try {
      if (editMode) {
        const res = await api.put(`/products/${formData.id}`, {
          product_code: formData.code,
          status: formData.status,
        });
        if (res.data?.success) toast.success("Product updated successfully");
      } else {
        const res = await api.post("/products/create-prod", {
          customer_model_id: formData.customerModelId,
          product_code: formData.code,
        });
        if (res.data?.success) toast.success("Product created successfully");
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Operation failed"
      );
    }
  };

  // ---------- Columns ----------

  const columns = [
    {
      field: "name",
      headerName: "Product Code",
      width: 450,
      renderCell: (params) => (
        <span className="truncate block text-gray-700 font-medium">
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 300,
      renderCell: (params) => (
        <Chip
          label={params.value === "ACTIVE" ? "Active" : "Inactive"}
          color={params.value === "ACTIVE" ? "success" : "default"}
          size="small"
          variant={params.value === "ACTIVE" ? "filled" : "outlined"}
          sx={{ fontWeight: 300 }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Pencil size={18} />
            </IconButton>
          </Tooltip>
  
        </div>
      ),
    },
  ];

  // ---------- Render ----------

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 border-b border-gray-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800">Products</h3>
              <p className="text-sm text-gray-600">Manage products</p>
            </div>
            <PrimaryButton
              startIcon={<PlusCircle size={19} />}
              onClick={() => handleOpenDialog()}
              disabled={
                !selectedCategory ||
                !selectedSubCategory ||
                !selectedModelSpec ||
                !selectedCustomerModel
              }
            >
              Add Product
            </PrimaryButton>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap gap-4">
            {/* Category */}
            <div className="w-52">
              <label className="block text-xs font-bold text-black mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] outline-none"
              >
                <option value="">Select Category</option>

                {categories
                 .filter((cat) => cat.status === "ACTIVE")
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div className="w-52">
              <label className="block text-xs font-bold text-black mb-1">
                Sub Category
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(Number(e.target.value))}
                disabled={!selectedCategory}
                className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>

                {subCategories
                 .filter((sub) => sub.status === "ACTIVE")
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Spec */}
            <div className="w-52">
              <label className="block text-xs font-bold text-black mb-1">
                Model Spec
              </label>
              <select
                value={selectedModelSpec}
                onChange={(e) => setSelectedModelSpec(Number(e.target.value))}
                disabled={!selectedSubCategory}
                className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>

                {modelSpecs
                 .filter((s) => s.status === "ACTIVE")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Model */}
            <div className="w-52">
              <label className="block text-xs font-bold text-black mb-1">
                Customer Model
              </label>
              <select
                value={selectedCustomerModel}
                onChange={(e) => setSelectedCustomerModel(Number(e.target.value))}
                disabled={!selectedModelSpec}
                className="w-full text-xs py-1.5 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select...</option>

                {customerModels
                 .filter((m) => m.status === "ACTIVE")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 relative">
            <Search
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
              className="w-full pl-10 text-xs py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
          ) : (
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              density="compact"
              disableRowSelectionOnClick
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeader": {
                  background: "#1c2649 !important",
                  color: "white",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaders": { fontSize: "11px" },
                "& .MuiDataGrid-cell": { fontSize: "11px" },
              }}
            />
          )}
        </div>
      </div>

      {/* Dialog — Add / Edit */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-xl" }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-[#1c2649] px-5 py-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Package className="text-white" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {editMode ? "Edit Product" : "Create New Product"}
                  </h4>
                  <p className="text-blue-100 text-xs">
                    {editMode ? "Update product information" : "Add a new product"}
                  </p>
                </div>
              </div>
              <IconButton size="small" onClick={handleCloseDialog}>
                <X size={20} className="text-white" />
              </IconButton>
            </div>
          </div>

          {/* Form Body */}
          <DialogContent className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              {/* Product Code */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Product Code"
                  name="code"
                  size="small"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Hash size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Category — disabled */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Category"
                  size="small"
                  value={getCategoryName(formData.categoryId)}
                  disabled
                />
              </div>

              {/* Sub Category — disabled */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Sub Category"
                  size="small"
                  value={getSubCategoryName(formData.subCategoryId)}
                  disabled
                />
              </div>

              {/* Model Spec — disabled */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Model Spec"
                  size="small"
                  value={getModelSpecName(formData.modelSpecId)}
                  disabled
                />
              </div>

              {/* Customer Model — disabled */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Customer Model"
                  size="small"
                  value={getCustomerModelName(formData.customerModelId)}
                  disabled
                />
              </div>

              {/* Status — edit only */}
              {editMode && (
                <div className="col-span-2">
                  <TextField
                    fullWidth
                    label="Status"
                    name="status"
                    select
                    size="small"
                    value={formData.status}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CheckCircle size={16} className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    sx={TextFieldCss}
                  >
                    <MenuItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Active
                      </div>
                    </MenuItem>
                    <MenuItem value="INACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Inactive
                      </div>
                    </MenuItem>
                  </TextField>
                </div>
              )}
            </div>
          </DialogContent>

          {/* Footer */}
          <div className="px-5 py-3 bg-white border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <SecondaryButton onClick={handleCloseDialog}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">
              {editMode ? "Update Product" : "Create Product"}
            </PrimaryButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Products;