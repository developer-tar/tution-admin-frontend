import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

const thresholds = {
  green: "#5cb85c",   // Below 5%
  yellow: "#f0ad4e",  // 5-10%
  red: "#d9534f"      // Over 10%
};

const getCellColor = (value) => {
  const percentage = parseFloat(value.split("/")[0]) / parseFloat(value.split("/")[1]) * 100;
  if (percentage <= 5) return thresholds.green;
  if (percentage <= 10) return thresholds.yellow;
  return thresholds.red;
};

const StudentReportCardTable = ({ data }) => {
  return (
    <Table sx={{ mt: 2 }} size="small">
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          {data.subjects.map((subj) => (
            <TableCell align="center" colSpan={2} key={subj.key}>
              <Typography fontWeight="bold">{subj.label}</Typography>
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell></TableCell>
          {data.subjects.map((_) => (
            <>
              <TableCell align="center">Homework</TableCell>
              <TableCell align="center">Plenary</TableCell>
            </>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell>{row.label}</TableCell>
            {row.values.map((value, idx) => (
              <TableCell
                align="center"
                key={idx}
                sx={
                  row.label === "Late Tasks" || row.label === "Overdue Tasks"
                    ? { color: getCellColor(value), fontWeight: 600 }
                    : {}
                }
              >
                {value}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentReportCardTable;
