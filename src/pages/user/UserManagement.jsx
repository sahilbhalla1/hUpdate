import { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Dialog, DialogContent, TextField, MenuItem, Chip, IconButton, Tooltip, CircularProgress, InputAdornment } from "@mui/material";
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
  Users,
  User,
  UserCheck,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { sanitizeInput } from "../../utils/SanitizeInput";
import { BLUE, DARKGREEN, PRIMARY_COLOR } from "../../components/Color";

const TextFieldCss = { "& .MuiOutlinedInput-root": { "&:hover fieldset": { borderColor: "#3b82f6" } } };
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active",
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered users based on search
  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Stats calculation
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  // Handle dialog
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setFormData({ ...user, password: "" });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      id: null,
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    });
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Fields to skip sanitization
    const noSanitize = ["email", "password"];

    setFormData((prev) => ({
      ...prev,
      [name]: noSanitize.includes(name) ? value : sanitizeInput(value),
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!editMode && !formData.password.trim()) {
      toast.error("Password is required for new users");
      return;
    }

    try {
      const payload = { ...formData };
      if (editMode && !payload.password) {
        delete payload.password;
      }

      if (editMode) {
        await api.put(`/users/${formData.id}`, payload);
        toast.success("User updated successfully");
      } else {
        await api.post("/auth/register", payload);
        toast.success("User created successfully");
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "role",
      headerName: "Role",
      width: 130,
      renderCell: (params) => {
        const roleConfig = {
          ADMIN: { color: "error", label: "Admin" },
          L1: { color: "primary", label: "L1" },
          L2: { color: "primary", label: "L2" },
          L3: { color: "primary", label: "L3" },
          EXTERNAL: { color: "warning", label: "External" },
          INTERNAL: { color: "warning", label: "Internal" },
        };
        const config = roleConfig[params.value] || roleConfig.user;
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 300 }} />;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
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
      field: "created_at",
      headerName: "Created At",
      width: 120,
      valueFormatter: (params) =>
        params
          ? new Date(params).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-1">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)} className="text-blue-600 hover:bg-blue-50">
              <Pencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} className="text-red-600 hover:bg-red-50">
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className=" space-y-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div style={{ background: PRIMARY_COLOR }} className=" rounded-xl p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Users</p>
              <p className="text-xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div style={{ background: DARKGREEN }} className="rounded-xl p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Active Users</p>
              <p className="text-xl font-bold mt-1">{stats.active}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <UserCheck size={25} />
            </div>
          </div>
        </div>

        <div style={{ background: BLUE }} className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Admins</p>
              <p className="text-xl font-bold mt-1">{stats.admins}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <ShieldCheck size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-2 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800">Users</h3>
              <p className="text-sm text-gray-600 ">Manage your team members and their roles</p>
            </div>
            <PrimaryButton startIcon={<UserPlus size={19} />} onClick={() => handleOpenDialog()}>
              Add User
            </PrimaryButton>
          </div>

          {/* Search */}
          <div className="mt-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
              className="w-full pl-10 text-xs  py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c2649] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* DataGrid */}
        <div className="p-2">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
          ) : (
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[5, 10, 25, 50]}
              density="compact"
              disableRowSelectionOnClick
              autoHeight
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
            />
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl" }}>
        <form onSubmit={handleSubmit}>
          {/* Header with Gradient */}
          <div className="bg-[#1c2649] px-5 py-1.5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <User className="text-white" size={18} />
                </div>
                <div>
                  <h4 className=" font-bold text-white">{editMode ? "Edit User" : "Create New User"}</h4>
                  <p className="text-blue-100 text-xs">{editMode ? "Update user information" : "Add a new team member"}</p>
                </div>
              </div>
              <IconButton size="small" onClick={handleCloseDialog} className="text-white hover:bg-white/20 transition-colors">
                <X size={20} />
              </IconButton>
            </div>
          </div>

          {/* Form Content */}
          <DialogContent className="p-3 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2.5">
              {/* Full Name */}
              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  size="small"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  size="small"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  size="small"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  size="small"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editMode}
                  helperText={
                    editMode ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Lock size={16} />
                        Leave blank to keep current password
                      </span>
                    ) : (
                      "Minimum 6 characters required"
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                />
              </div>

              {/* Role */}
              <div>
                <TextField
                  fullWidth
                  label="User Role"
                  name="role"
                  size="small"
                  select
                  value={formData.role}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Shield size={16} className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={TextFieldCss}
                >
                  <MenuItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Admin
                    </div>
                  </MenuItem>
                  <MenuItem value="L1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      L1 (Create Ticket)
                    </div>
                  </MenuItem>
                  <MenuItem value="L2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      L2 (Service Tracking)
                    </div>
                  </MenuItem>
                  <MenuItem value="L3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      L3 (Complaint/Escalation)
                    </div>
                  </MenuItem>
                  <MenuItem value="INTERNAL">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Internal (Tech Validation)
                    </div>
                  </MenuItem>
                  <MenuItem value="EXTERNAL">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      External (Tech Validation)
                    </div>
                  </MenuItem>
                </TextField>
              </div>

              {/* Status */}
              <div>
                <TextField
                  fullWidth
                  label="Account Status"
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
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Active
                    </div>
                  </MenuItem>
                  <MenuItem value="INACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Inactive
                    </div>
                  </MenuItem>
                </TextField>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900">Role Permissions</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Each role has specific permissions. Admins have full access, Agents handle tickets.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>

          {/* Footer Actions */}
          <div className="px-5 py-2 bg-white border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <SecondaryButton onClick={handleCloseDialog}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">{editMode ? "✓ Update User" : "+ Create User"}</PrimaryButton>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default UserManagement;
