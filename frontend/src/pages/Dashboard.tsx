import React, { useEffect } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, Divider } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, loadAnalytics, loadCategories, loadProducts } from '../store';
import FileUpload from '../components/FileUpload';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import Filters from '../components/Filters';
import ProductsTable from '../components/ProductsTable';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: analytics, loading: analyticsLoading } = useSelector((s: RootState) => s.analytics);
  const { filters } = useSelector((s: RootState) => s.products);

  useEffect(() => {
    dispatch(loadAnalytics());
    dispatch(loadCategories());
    dispatch(loadProducts(filters));
  }, []); // eslint-disable-line

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <BarChartIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight={700} color="primary">
            Product Ratings & Review Analytics
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <FileUpload />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" fontWeight={600} mb={2}>📊 Analytics Overview</Typography>
        <SummaryCards summary={analytics?.summary} loading={analyticsLoading} />
        <Charts data={analytics} loading={analyticsLoading} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={600} mb={2}>🔍 Browse Products</Typography>
        <Filters />
        <ProductsTable />
      </Container>
    </>
  );
}
