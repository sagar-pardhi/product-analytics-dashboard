import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Typography, Chip, Box, Skeleton, Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, setPage } from '../store';

function RatingChip({ value }: { value: number | null }) {
  if (value === null) return <Typography variant="body2" color="text.disabled">N/A</Typography>;
  const color = value >= 4 ? 'success' : value >= 3 ? 'warning' : 'error';
  return <Chip label={`${value} ★`} color={color} size="small" />;
}

export default function ProductsTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, pagination, loading, filters } = useSelector((s: RootState) => s.products);

  const handleChangePage = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage + 1));
  };

  const formatPrice = (val: number | null) => val ? `₹${val.toLocaleString()}` : '—';
  const formatDiscount = (val: number | null) => val ? `${Math.round(val * 100)}%` : '—';

  const cols = [
    { id: 'product_name', label: 'Product Name', minWidth: 220 },
    { id: 'main_category', label: 'Category', minWidth: 130 },
    { id: 'discounted_price', label: 'Price', minWidth: 80 },
    { id: 'actual_price', label: 'MRP', minWidth: 80 },
    { id: 'discount_percentage', label: 'Discount', minWidth: 80 },
    { id: 'rating', label: 'Rating', minWidth: 80 },
    { id: 'rating_count', label: 'Reviews', minWidth: 90 },
    { id: 'review_title', label: 'Review Title', minWidth: 160 },
  ];

  return (
    <Paper>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Products
          {!loading && <Chip label={pagination.total.toLocaleString()} size="small" sx={{ ml: 1 }} />}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {cols.map(col => (
                <TableCell key={col.id} sx={{ minWidth: col.minWidth, fontWeight: 700, bgcolor: 'grey.50' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: filters.limit }).map((_, i) => (
                <TableRow key={i}>
                  {cols.map(col => (
                    <TableCell key={col.id}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={cols.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No products found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Tooltip title={row.product_name} placement="top-start">
                      <Typography variant="body2" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.product_name}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.main_category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatPrice(row.discounted_price)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      {formatPrice(row.actual_price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.discount_percentage ? (
                      <Chip label={formatDiscount(row.discount_percentage)} color="success" size="small" />
                    ) : '—'}
                  </TableCell>
                  <TableCell><RatingChip value={row.rating} /></TableCell>
                  <TableCell>{row.rating_count ? row.rating_count.toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <Tooltip title={row.review_title} placement="top-start">
                      <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.review_title || '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={() => {}}
        rowsPerPageOptions={[10]}
      />
    </Paper>
  );
}
