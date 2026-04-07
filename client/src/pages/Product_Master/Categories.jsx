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
} from "@mui/material";
import {
  Pencil,
  Search,
  Tag,
  CheckCircle,
  X,
  PlusCircle,
  Hash
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

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    description: "",
    status: "ACTIVE",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/product-master/"); // ✅ uncomment this
      setCategories(data); // backend already returns array
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.status === "ACTIVE").length,
    inactive: categories.filter((c) => c.status === "INACTIVE").length,
  };

  // Same modal for both Add and Edit


  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData({
        id: category.id,
        name: category.name || "",
        code: category.code || "",
        status: category.status || "ACTIVE",
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        code: "",
        status: "ACTIVE",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ id: null, name: "", code: "", description: "", status: "ACTIVE" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Category code is required");
      return;
    }

    try {
      if (editMode) {
        // ✅ Correct UPDATE API
        const res = await api.put(`/product-master/${formData.id}`, {
          name: formData.name,
          code: formData.code,
          status: formData.status,
        });

        if (res.data?.success) {
          toast.success("Category updated successfully");
        }

      } else {
        // ✅ Correct ADD API
        const res = await api.post("/product-master/create-category", {
          name: formData.name,
          code: formData.code,
        });

        if (res.data?.success) {
          toast.success("Category created successfully");
        }
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      // Handle duplicate error properly
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message); // for "Category already exists"
      } else {
        toast.error("Operation failed");
      }

      console.error(error);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Category Name",
      width: 450,
      renderCell: (params) => (
        <span className="truncate block text-gray-700">
          {params.value}
        </span>
      ),
    },
    {
      field: "code",
      headerName: "Code",
      width: 250,
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
      width: 230,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-1">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)} className="text-blue-600 hover:bg-blue-50">
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
              <h3 className="font-bold text-gray-800">Categories</h3>
              <p className="text-sm text-gray-600">Manage ticket categories and their status</p>
            </div>
            <PrimaryButton startIcon={<PlusCircle size={19} />} onClick={() => handleOpenDialog()}>
              Add Category
            </PrimaryButton>
          </div>
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
            <div className="flex justify-center items-center h-96"><CircularProgress /></div>
          ) : (
            <DataGrid
              rows={filteredCategories}
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

      {/* Dialog — same for Add & Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl" }}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-[#1c2649] px-5 py-1.5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Tag className="text-white" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{editMode ? "Edit Category" : "Create New Category"}</h4>
                  <p className="text-blue-100 text-xs">{editMode ? "Update category information" : "Add a new ticket category"}</p>
                </div>
              </div>
              <IconButton size="small" onClick={handleCloseDialog} className="text-white hover:bg-white/20 transition-colors">
                <X size={20} />
              </IconButton>
            </div>
          </div>

          {/* Form */}

          <DialogContent className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">

              {/* Category Name */}
              <TextField
                fullWidth
                label="Category Name"
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

              {/* Category Code */}
              <TextField
                fullWidth
                label="Category Code"
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


              {/* Status (full width) — only shown in Edit mode */}
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
          <div className="px-5 py-2 bg-white border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <SecondaryButton onClick={handleCloseDialog}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">{editMode ? "Update Category" : "Create Category"}</PrimaryButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Categories;