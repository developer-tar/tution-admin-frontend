// components/TuitionCard.jsx
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArticleIcon from "@mui/icons-material/Article";
import PieChartIcon from "@mui/icons-material/PieChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom"; //  Required
import { button, icon } from "../style";

const TuitionCard = ({ image, title, description, progress = 80 }) => {
  const navigate = useNavigate(); //  Hook for navigation

  return (
    <Box
      onClick={() => navigate("/tuition-details")} //  Navigate on card click
      sx={{
        borderRadius: 2,
        boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
        cursor: "pointer", // Good UX
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.01)",
        },
      }}
    >
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{ width: "100%", height: 160, objectFit: "cover" }}
      />

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography fontWeight={700} fontSize="16px">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2} mt={2}>
          {[PlayArrowIcon, ArticleIcon, PieChartIcon].map((IconComponent, index) => (
            <Box
              key={index}
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "#EDF2F7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#4450A5",
                  "& svg": {
                    color: "#fff",
                  },
                },
              }}
            >
              <IconComponent sx={{ fontSize: 18, color: "#555" }} />
            </Box>
          ))}

          <Box ml="auto" position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={progress}
              size={38}
              thickness={4}
              sx={{ color: "#4450A5" }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" component="div" color="text.secondary">
                {`${progress}%`}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button disableElevation sx={button}>
          Continue
          <Box sx={icon}>
            <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default TuitionCard;
