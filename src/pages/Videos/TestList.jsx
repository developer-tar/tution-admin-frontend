import { Box, Typography, Stack, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import CommonLoader from "../../components/CommonLoader";
const TestList = ({ relatedData = {}, slugUrl, loading }) => {
  if (loading) {
    return (
       <CommonLoader sx={{ p: 3, textAlign: "center", borderRadius: 2 }} />
    );
  }
  const testEntries = Object.entries(relatedData);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid #eee" }}>
      <Typography fontWeight={600} fontSize="16px" mb={2}>
        Tests
      </Typography>

      {testEntries.length === 0 ? (
        <Typography fontSize="14px" color="text.secondary">
          No test found.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {testEntries.map(([testId, testName], idx) => (
            <Box
              key={testId}
              sx={{
                borderRadius: 1,
                px: 2,
                py: 1,
                bgcolor: idx === 0 ? "#f5f9ff" : "transparent",
                borderLeft: idx === 0 ? "3px solid #26177C" : "none",
              }}
            >
              <Typography fontSize="14px" fontWeight={idx === 0 ? 600 : 500}>
                <Link
                  // to={`/student/${slugUrl}/test/${testId}`}
                  to={`/student/test`}
                  style={{
                    textDecoration: "none",
                    color: "#26177C",
                    fontWeight: 500,
                  }}
                >
                  {idx + 1}. {testName}
                </Link>
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default TestList;
