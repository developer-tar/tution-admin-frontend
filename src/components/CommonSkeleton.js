import React from "react";
import { Skeleton, TableRow, TableCell, Stack } from "@mui/material";

// Common skeleton component for loading states
const CommonSkeleton = ({ type = "card", rows = 5, cols = 4, height = 30 }) => {
  if (type === "table") {
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" height={height} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
};

export default CommonSkeleton;

