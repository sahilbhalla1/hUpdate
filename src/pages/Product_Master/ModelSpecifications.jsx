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
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { sanitizeInput } from "../../utils/SanitizeInput";


const TextFieldCss = {
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#3b82f6" },
  },
};

const ModelSpecifications = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);


  const [formData, setFormData] = useState({
    spec_value: "",
    categoryId: "",
    subCategoryId: "",
    status: "ACTIVE"
  });

  // Fetch parent categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/product-master/");
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    }
  }, []);



  const fetchSubCategories = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/pro-mst/sub/get-sub`,
        {
          params: { category_id: selectedCategory }
        }
      );

      const formatted = res.data.data.map(item => ({
        ...item,
        categoryId: item.category_id
      }));

      setSubCategories(formatted);
    } catch (error) {
      toast.error("Failed to load sub-categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch model specs filtered by category + sub-category

  const fetchSpecs = useCallback(async () => {
    if (!selectedSubCategory) return;

    setLoading(true);
    try {
      const res = await api.get(`/modspec/get-modspec`, {
        params: { sub_category_id: selectedSubCategory }
      });

      const formatted = res.data.data.map(item => ({
        ...item,
        name: item.spec_value,        // ✅ map correct field
        subCategoryId: item.sub_category_id
      }));

      setSpecs(formatted);

    } catch (error) {
      toast.error("Failed to load model specifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedSubCategory]);


  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchSubCategories(); }, [fetchSubCategories]);
  useEffect(() => { fetchSpecs(); }, [fetchSpecs]);

  const filteredSpecs = specs.filter(
    (spec) =>
      spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spec.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (spec = null) => {
    if (spec) {
      setEditMode(true);
      setFormData({
        id: spec.id,
        spec_value: spec.name || spec.spec_value || "", // ✅ FIX HERE
        categoryId: spec.categoryId || selectedCategory,
        subCategoryId: spec.subCategoryId || selectedSubCategory,
        status: spec.status || "ACTIVE",
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        code: "",
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory,
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
      status: "ACTIVE",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Updated validation
    if (!formData.spec_value?.trim()) {
      toast.error("Spec value is required");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.subCategoryId) {
      toast.error("Please select a sub-category");
      return;
    }

    try {
      if (editMode) {
        const res = await api.put(`/modspec/${formData.id}`, {
          spec_value: formData.spec_value,
          status: formData.status,
        });

        if (res.data?.success) {
          toast.success("Spec updated successfully");
        }
      } else {
        const res = await api.post(`/modspec/create-modspec`, {
          sub_category_id: formData.subCategoryId, // ✅ correct key
          spec_value: formData.spec_value,         // ✅ direct mapping
        });

        if (res.data?.success) {
          toast.success("Spec created successfully");
        }
      }

      handleCloseDialog();
      fetchSpecs();

    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Operation failed");
      }
      console.error(error);
    }
  };

const getCategoryName = (id) =>
  categories.find((c) => String(c.id) === String(id))?.name || "—";

  const getSubCategoryName = (id) =>
    subCategories.find((s) => s.id === id)?.name || "—";

  // Sub-categories filtered by the dialog's selected categoryId



  const columns = [
    {
      field: "name",
      headerName: "Spec Name",
      width: 500,
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

  return (
    <div className="space-y-2">
      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 border-b border-gray-200">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800">Model Specifications</h3>
              <p className="text-sm text-gray-600">Manage model specs</p>
            </div>
            <PrimaryButton
              startIcon={<PlusCircle size={19} />}
              onClick={() => handleOpenDialog()}
              disabled={!selectedSubCategory || !selectedSubCategory }
            >
              Add Spec
            </PrimaryButton>
          </div>

          {/* Category + Sub-Category filters */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="w-56">
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

            <div className="w-56">
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
              rows={filteredSpecs}
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
                  <Settings2 className="text-white" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {editMode
                      ? "Edit Model Specification"
                      : "Create New Model Specification"}
                  </h4>
                  <p className="text-blue-100 text-xs">
                    {editMode
                      ? "Update specification information"
                      : "Add a new model specification"}
                  </p>
                </div>
              </div>
              <IconButton
                size="small"
                onClick={handleCloseDialog}
                className="text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </IconButton>
            </div>
          </div>

          {/* Form Body */}

          <DialogContent className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">

              {/* Spec Value */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Spec Value"
                  name="spec_value"
                  size="small"
                  value={formData.spec_value}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Tag size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Parent Category */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Category"
                  size="small"
                  value={getCategoryName(formData.categoryId)}
                  disabled
                />
              </div>

              {/* Sub Category */}
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Sub Category"
                  size="small"
                  value={getSubCategoryName(formData.subCategoryId)}
                  disabled
                />
              </div>

              {/* Status — only in Edit mode */}
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
              {editMode ? "Update Spec" : "Create Spec"}
            </PrimaryButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ModelSpecifications;