import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Skeleton,
  Typography,
} from "@mui/material";

const DataTable = ({
  loading = false,
  data = [],
  page = 0,
  rowsPerPage = 10,
  setPage = () => {},
  columns = [],
  isFilterSelected = true,
}) => {
  const renderTableHead = () => (
    <TableHead>
      <TableRow>
        {columns.map((col, idx) => (
          <TableCell key={idx}><strong>{col.label}</strong></TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderSkeletonRows = () => (
    [...Array(5)].map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {columns.map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton variant="text" width={100} />
          </TableCell>
        ))}
      </TableRow>
    ))
  );

  const renderDataRows = () =>
    data
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((col, colIndex) => (
            <TableCell key={colIndex}>
              {typeof col.render === "function"
                ? col.render(row)
                : row[col.key] ?? "N/A"}
            </TableCell>
          ))}
        </TableRow>
      ));

  const renderTable = () => (
    <Paper sx={{ width: "100%", overflowX: "auto" }}>
      <TableContainer>
        <Table>
          {renderTableHead()}
          <TableBody>
            {loading ? renderSkeletonRows() : renderDataRows()}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && (
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      )}
    </Paper>
  );

  return (
    <>
      {loading
        ? renderTable()
        : !isFilterSelected
        ? <Typography>Select both filters to load data.</Typography>
        : data.length === 0
        ? <Typography>No data found for selected filters.</Typography>
        : renderTable()}
    </>
  );
};

export default DataTable;
