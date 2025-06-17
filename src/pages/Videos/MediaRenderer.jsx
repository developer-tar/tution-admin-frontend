import { Box, Typography, Paper } from "@mui/material";

const MediaRenderer = ({ data, loading }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
        <Typography fontWeight={500}>Loading media...</Typography>
      </Paper>
    );
  }

  const mediaList = [
    ...(data?.topic_media || []),
    ...(data?.sub_topic_media || [])
  ];

  if (mediaList.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: "#f9f9f9",
          border: "1px dashed #ccc"
        }}
      >
        <Typography fontWeight={500} color="text.secondary">
          No media found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {mediaList.map((media, index) => {
        const type = media.type?.trim();

        if (type?.startsWith("video/")) {
          return (
            <Paper key={index} elevation={1} sx={{ overflow: "hidden", borderRadius: 2 }}>
              <video width="100%" controls>
                <source src={media.url} type={type} />
                Your browser does not support the video tag.
              </video>
            </Paper>
          );
        }

        if (type?.startsWith("image/")) {
          return (
            <Paper key={index} elevation={1} sx={{ p: 1, borderRadius: 2, textAlign: "center" }}>
              <img
                src={media.url}
                alt={`Media ${index + 1}`}
                style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }}
              />
            </Paper>
          );
        }

        if (type === "application/pdf") {
          return (
            <Paper key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#26177C", fontWeight: 600 }}
                >
                  📄 View PDF #{index + 1}
                </a>
              </Typography>
            </Paper>
          );
        }

        return (
          <Paper key={index} elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: "#fff3cd" }}>
            <Typography color="text.secondary">
              ⚠️ Unsupported media type: {type}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default MediaRenderer;
