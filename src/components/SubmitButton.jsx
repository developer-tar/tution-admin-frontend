import { Grid, Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const SubmitButton = ({ loading, label = "Save" }) => {
  return (
    <Grid item xs={12}>
      <Button
        type="submit"
        fullWidth
        sx={{
          background: "linear-gradient(to right, #3f2b96, #a71d31)",
          color: "#fff",
          borderRadius: "30px",
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          textTransform: "none",
          transition: "0.3s",
          "&:hover": {
            background: "linear-gradient(to right, #3f2b96, #a71d31)",
            transform: "scale(1.02)",
          },
        }}
        endIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />
        }
        disabled={loading}
      >
        {loading ? "Saving..." : label}
      </Button>
    </Grid>
  );
};

export default SubmitButton;
