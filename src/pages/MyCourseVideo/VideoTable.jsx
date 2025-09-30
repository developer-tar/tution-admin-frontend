<<<<<<< HEAD
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const mockData = Array(6).fill({
  id: "7112",
  type: "Homework",
  topic: "Vocabulary -",
  week: "Week 10",
  mode: "MC",
  date: "19 Mar 2025 17:14",
  score: "100%",
  action: "Action",
});

const VideoTable = () => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#FAFAFF" }}>
          <TableRow>
            {["ID", "Type", "Topic", "Week", "Mode", "Date", "Score", "Action"].map((header) => (
              <TableCell key={header}>
                <Typography fontWeight={600}>{header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.topic}</TableCell>
              <TableCell>{row.week}</TableCell>
              <TableCell>{row.mode}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.score}</TableCell>
              <TableCell sx={{ color: "#26177C", fontWeight: 500 }}>{row.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VideoTable;
=======
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const mockData = Array(6).fill({
  id: "7112",
  type: "Homework",
  topic: "Vocabulary -",
  week: "Week 10",
  mode: "MC",
  date: "19 Mar 2025 17:14",
  score: "100%",
  action: "Action",
});

const VideoTable = () => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#FAFAFF" }}>
          <TableRow>
            {["ID", "Type", "Topic", "Week", "Mode", "Date", "Score", "Action"].map((header) => (
              <TableCell key={header}>
                <Typography fontWeight={600}>{header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.topic}</TableCell>
              <TableCell>{row.week}</TableCell>
              <TableCell>{row.mode}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.score}</TableCell>
              <TableCell sx={{ color: "#26177C", fontWeight: 500 }}>{row.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VideoTable;
>>>>>>> master
