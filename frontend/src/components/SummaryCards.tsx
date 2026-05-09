import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Summary } from '../types';

interface Props {
  summary: Summary | undefined;
  loading: boolean;
}

const cards = [
  {
    key: 'total_products',
    label: 'Total Products',
    icon: InventoryIcon,
    color: '#3b82f6',
    format: (v: number | null) => (v != null ? Number(v).toLocaleString() : '0'),
  },
  {
    key: 'avg_rating',
    label: 'Avg Rating',
    icon: StarIcon,
    color: '#f59e0b',
    format: (v: number | null) => (v != null ? `${Number(v).toFixed(1)} ★` : 'N/A'),
  },
  {
    key: 'avg_discount_pct',
    label: 'Avg Discount',
    icon: LocalOfferIcon,
    color: '#10b981',
    format: (v: number | null) => (v != null ? `${Number(v).toFixed(1)}%` : 'N/A'),
  },
  {
    key: 'total_reviews',
    label: 'Total Reviews',
    icon: RateReviewIcon,
    color: '#8b5cf6',
    format: (v: number | null) => (v != null ? Number(v).toLocaleString() : 'N/A'),
  },
];

export default function SummaryCards({ summary, loading }: Props) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map(({ key, label, icon: Icon, color, format }) => (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}` }}>
            <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1.5, display: 'flex' }}>
              <Icon sx={{ color, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              {loading ? (
                <Skeleton width={80} height={32} />
              ) : (
                <Typography variant="h5" fontWeight={700}>
                  {summary ? format(summary[key as keyof Summary] as number | null) : '—'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
