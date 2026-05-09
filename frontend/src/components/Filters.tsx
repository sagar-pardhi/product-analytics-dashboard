import React, { useEffect, useState } from 'react';
import {
  Paper, Grid, TextField, MenuItem, Box, Typography, Slider, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, setFilters, loadProducts } from '../store';

export default function Filters() {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, categories } = useSelector((s: RootState) => s.products);
  const [search, setSearch] = useState(filters.search);
  const [rating, setRating] = useState<number[]>([filters.minRating, filters.maxRating]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setFilters({ search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  // Reload when filters change
  useEffect(() => {
    dispatch(loadProducts(filters));
  }, [filters, dispatch]);

  const handleCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ category: e.target.value }));
  };

  const handleRatingChange = (_: Event, newVal: number | number[]) => {
    const [min, max] = newVal as number[];
    setRating([min, max]);
  };

  const handleRatingCommit = (_: unknown, newVal: number | number[]) => {
    const [min, max] = newVal as number[];
    dispatch(setFilters({ minRating: min, maxRating: max }));
  };

  const handleClear = () => {
    setSearch('');
    setRating([0, 5]);
    dispatch(setFilters({ search: '', category: '', minRating: 0, maxRating: 5 }));
  };

  return (
    <Paper sx={{ p: 2.5, mb: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterListIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>Filters & Search</Typography>
        <Box flex={1} />
        <Button size="small" startIcon={<ClearIcon />} onClick={handleClear}>Clear All</Button>
      </Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Search Product Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select fullWidth size="small" label="Category" value={filters.category} onChange={handleCategory}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => (
              <MenuItem key={c.category} value={c.category}>{c.category} ({c.count})</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3} md={4}>
          <Typography variant="caption" color="text.secondary">
            Rating: {rating[0]} – {rating[1]} ★
          </Typography>
          <Slider
            value={rating}
            onChange={handleRatingChange}
            onChangeCommitted={handleRatingCommit}
            min={0} max={5} step={0.5}
            valueLabelDisplay="auto"
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
