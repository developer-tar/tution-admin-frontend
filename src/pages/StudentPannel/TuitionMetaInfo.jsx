import React from "react";
import { Box, Grid, Typography, Stack,  CircularProgress, } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ListAltIcon from "@mui/icons-material/ListAlt";

const TuitionMetaInfo = ({ image,  }) => {


  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Box component="img" src={image} alt="course" sx={{ width: "100%", borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={7}>
        <Typography fontWeight={700} fontSize="18px" mb={1}>
          Year 3 11+ Tuition
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries, but also the leap into electronic typesetting.
        </Typography>

        <Stack direction="row" spacing={5} mb={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">Duration:</Typography>
            <Typography fontWeight={600}>12 hours</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Time Taken:</Typography>
            <Typography fontWeight={600}>5 hours</Typography>
          </Box>
        </Stack>

          <Stack direction="row" alignItems="center" spacing={2} mt={2}>
          {[PlayArrowIcon, PictureAsPdfIcon, ListAltIcon ].map((IconComponent, index) => (
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
              value="progress"
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
              80%
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TuitionMetaInfo;
