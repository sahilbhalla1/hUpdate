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

const SubCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    categoryId: "",
    status: "ACTIVE",
  });

  // Fetch parent categories for the dropdown
const fetchCategories = useCallback(async () => {
  try {
    const { data } = await api.get("/product-master/");
    setCategories(data);
    
    // ✅ Use functional update to read CURRENT selectedCategory, not stale closure
    setSelectedCategory((prev) => {
      if (data.length > 0 && !prev) {
        return data[0].id;
      }
      return prev; // keep existing selection unchanged
    });

  } catch (error) {
    toast.error("Failed to load categories");
    console.error(error);
  }
}, []); // ✅ empty deps is now safe — no stale closure


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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  const filteredSubCategories = subCategories.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (subCat = null) => {
    if (subCat) {
      setEditMode(true);
      setFormData({
        id: subCat.id,
        name: subCat.name || "",
        code: subCat.code || "",
      categoryId: subCat.categoryId || selectedCategory, // ✅ use row's categoryId
        status: subCat.status || "ACTIVE",
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        code: "",
         categoryId: selectedCategory,
        status: "ACTIVE",
      });
    }
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ id: null, name: "", code: "", categoryId: selectedCategory, status: "ACTIVE" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Sub-category name is required"); return; }
    if (!formData.code.trim()) { toast.error("Sub-category code is required"); return; }
    if (!formData.categoryId) { toast.error("Please select a category"); return; }

    try {
      if (editMode) {
        const res = await api.put(
          `/pro-mst/sub/${formData.id}`,
          {
            name: formData.name,
            code: formData.code,
            status: formData.status,
          }
        );
        if (res.data?.success) toast.success("Sub-category updated successfully");
      } else {
        const res = await api.post(
          `/pro-mst/sub/create-sub`,
          {
            name: formData.name,
            code: formData.code,
            category_id: formData.categoryId, // ✅ FIXED
          }
        );
        if (res.data?.success) toast.success("Sub-category created successfully");
      }
      handleCloseDialog();
      fetchSubCategories();
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

  const columns = [
    {
      field: "name",
      headerName: "Sub Category Name",
      width: 400,
      renderCell: (params) => (
        <span className="truncate block text-gray-700">{params.value}</span>
      ),
    },
    {
      field: "code",
      headerName: "Code",
      width: 300,
      renderCell: (params) => (
        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
          {params.value || "—"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 250,
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
      width: 220,
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800">Sub Categories</h3>
              <p className="text-sm text-gray-600">Manage sub categories under a category</p>
            </div>
            <PrimaryButton startIcon={<PlusCircle size={19} />} onClick={() => handleOpenDialog()}  disabled={!selectedCategory}>
              Add Sub Category
            </PrimaryButton>
          </div>

          {/* Category Filter */}

          <div className="mt-5 w-56">
            <label className="block text-xs font-bold text-black mb-1">
              Select Category
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


          {/* Search */}
          <div className="mt-5 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
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
              rows={filteredSubCategories}
              columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[5, 10, 25, 50]}
              density="compact"
              disableRowSelectionOnClick
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeader": { background: "#1c2649 !important", color: "white", fontWeight: "bold" },
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
                  <Layers className="text-white" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {editMode ? "Edit Sub Category" : "Create New Sub Category"}
                  </h4>
                  <p className="text-blue-100 text-xs">
                    {editMode ? "Update sub-category information" : "Add a new sub-category"}
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
              {/* Sub-Category Name */}
              <TextField
                fullWidth
                label="Sub Category Name"
                name="name"
                size="small"
                value={formData.name}
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

              {/* Code */}
              <TextField
                fullWidth
                label="Sub Category Code"
                name="code"
                size="small"
                value={formData.code}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Hash size={16} className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={TextFieldCss}
              />

              {/* Parent Category — full width */}
              <div className="col-span-2">
            
                <TextField
                  fullWidth
                  label="Category"
                  size="small"
                   value={getCategoryName(formData.categoryId) || "No category selected"}
                  disabled // 🔒 makes it read-only
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Layers size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
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
              {editMode ? " Update SubCategory" : "Create SubCategory"}
            </PrimaryButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default SubCategories;