import { Button } from "@mui/material";
import { PRIMARY_COLOR } from "./Color";

/* -----------------------------------------
   PRIMARY BUTTON (Filled)
------------------------------------------ */
export const PrimaryButton = ({
  children,
  onClick,
  startIcon,
  endIcon,
  type = "button",
  disabled = false,
  fullWidth = false,
  sx = {},
  ...rest
}) => {
  return (
    <Button
      variant="contained"
      type={type}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        textTransform: "none",
        bgcolor: PRIMARY_COLOR,
        "&:hover": { bgcolor: PRIMARY_COLOR + "dd" },
        fontSize: "13px",
        fontWeight: 600,
        borderRadius: "8px",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

/* -----------------------------------------
   SECONDARY BUTTON (Outlined)
------------------------------------------ */
export const SecondaryButton = ({
  children,
  onClick,
  type = "button",
  fullWidth = false,
  sx = {},
  color,
  ...rest
}) => {
  return (
    <Button
      variant="outlined"
      type={type}
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        textTransform: "none",
        borderColor: "#d1d5db",
        color: color || "#374151",
        fontSize: "13px",
        fontWeight: 600,
        borderWidth: 2,
        borderRadius: "8px",
        "&:hover": {
          borderColor: PRIMARY_COLOR,
          bgcolor: PRIMARY_COLOR + "0A",
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};
