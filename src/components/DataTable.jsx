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
  Box,
  Avatar,
  Card,
  CardContent,
  Fade,
} from "@mui/material";
import {
  SearchOff,
  FilterList,
  Assignment,
} from "@mui/icons-material";

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

  // Fancy Empty State Component
  const renderEmptyState = () => (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
          borderRadius: 3,
          border: '2px dashed rgba(102,126,234,0.2)',
          margin: 2,
        }}
      >
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 80,
            height: 80,
            mb: 3,
            boxShadow: '0 8px 25px rgba(102,126,234,0.3)',
          }}
        >
          <SearchOff sx={{ fontSize: 40, color: 'white' }} />
        </Avatar>
        
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          🔍 No Results Found
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(0,0,0,0.6)',
            fontWeight: 500,
            mb: 1,
            maxWidth: 400,
          }}
        >
          We couldn't find any data matching your selected filters.
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(0,0,0,0.5)',
            fontWeight: 400,
            maxWidth: 350,
          }}
        >
          💡 Try adjusting your filters or check back later for new content.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              width: 24,
              height: 24,
            }}
          >
            <FilterList sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(0,0,0,0.5)',
              fontWeight: 500,
            }}
          >
            Filters are active
          </Typography>
        </Box>
      </Box>
    </Fade>
  );

  // Fancy Filter Selection State
  const renderFilterSelectionState = () => (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(250,112,154,0.05) 0%, rgba(254,225,64,0.05) 100%)',
          borderRadius: 3,
          border: '2px dashed rgba(250,112,154,0.2)',
          margin: 2,
        }}
      >
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            width: 70,
            height: 70,
            mb: 3,
            boxShadow: '0 8px 25px rgba(250,112,154,0.3)',
          }}
        >
          <Assignment sx={{ fontSize: 35, color: 'white' }} />
        </Avatar>
        
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          📋 Ready to Explore
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(0,0,0,0.6)',
            fontWeight: 500,
            maxWidth: 350,
          }}
        >
          🎯 Select both filters above to load your assignment data and start learning!
        </Typography>
      </Box>
    </Fade>
  );

  return (
    <>
      {loading
        ? renderTable()
        : !isFilterSelected
        ? renderFilterSelectionState()
        : data.length === 0
        ? renderEmptyState()
        : renderTable()}
    </>
  );
};

export default DataTable;
