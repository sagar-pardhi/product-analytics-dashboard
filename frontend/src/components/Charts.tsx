import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AnalyticsData } from '../types';

interface Props {
  data: AnalyticsData | null;
  loading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];

const ChartCard = ({ title, children, height = 280 }: { title: string; children: React.ReactNode; height?: number }) => (
  <Paper sx={{ p: 2.5 }}>
    <Typography variant="subtitle1" fontWeight={600} mb={2}>{title}</Typography>
    <Box height={height}>{children}</Box>
  </Paper>
);

const LoadingChart = () => (
  <Box display="flex" flexDirection="column" gap={1} pt={2}>
    {[80, 60, 90, 50, 70].map((w, i) => <Skeleton key={i} variant="rectangular" width={`${w}%`} height={30} />)}
  </Box>
);

function truncateLabel(str: string, max = 16): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default function Charts({ data, loading }: Props) {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} md={6} key={i}>
            <ChartCard title="Loading..."><LoadingChart /></ChartCard>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data) return null;

  const catDistData = data.categoryDistribution.map(d => ({
    ...d,
    shortName: truncateLabel(d.category),
  }));

  const topReviewedData = data.topReviewed.map(d => ({
    ...d,
    shortName: truncateLabel(d.product_name, 20),
    rating_count: Number(d.rating_count),
  }));

  const catRatingData = data.categoryRating.map(d => ({
    ...d,
    shortName: truncateLabel(d.category),
    avg_rating: Number(d.avg_rating),
  }));

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Bar Chart: Products per Category */}
      <Grid item xs={12} md={6}>
        <ChartCard title="Products per Category" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catDistData} margin={{ left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Products']} labelFormatter={(l) => {
                const found = data.categoryDistribution.find(d => d.category.startsWith(l.replace('…', '')));
                return found?.category || l;
              }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {catDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Bar Chart: Top Reviewed Products */}
      <Grid item xs={12} md={6}>
        <ChartCard title="Top 10 Reviewed Products" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topReviewedData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="shortName" type="category" width={130} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Reviews']} labelFormatter={(l) => {
                const found = data.topReviewed.find(d => d.product_name.startsWith(l.replace('…', '')));
                return found?.product_name || l;
              }} />
              <Bar dataKey="rating_count" radius={[0, 4, 4, 0]}>
                {topReviewedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Histogram: Discount Distribution */}
      <Grid item xs={12} md={6}>
        <ChartCard title="Discount Distribution (Histogram)" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.discountDistribution} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Products']} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Bar Chart: Category-wise Average Rating */}
      <Grid item xs={12} md={6}>
        <ChartCard title="Category-wise Average Rating" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catRatingData} margin={{ left: -10, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} ★`, 'Avg Rating']} />
              <Bar dataKey="avg_rating" radius={[4, 4, 0, 0]}>
                {catRatingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  );
}
