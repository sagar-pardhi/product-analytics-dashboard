import React, { useCallback, useState } from 'react';
import {
  Box, Paper, Typography, Button, LinearProgress, Alert, Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, uploadFile, clearUploadState, loadAnalytics, loadProducts, loadCategories } from '../store';

export default function FileUpload() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((s: RootState) => s.upload);
  const { filters } = useSelector((s: RootState) => s.products);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    dispatch(clearUploadState());
    const result = await dispatch(uploadFile(file));
    if (uploadFile.fulfilled.match(result)) {
      dispatch(loadAnalytics());
      dispatch(loadCategories());
      dispatch(loadProducts(filters));
    }
  }, [dispatch, filters]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>Import Data</Typography>
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        sx={{
          border: `2px dashed`,
          borderColor: dragging ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: dragging ? 'primary.50' : 'grey.50',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" mb={2}>
          Drag & drop Excel/CSV file here, or
        </Typography>
        <Button variant="contained" component="label" disabled={loading}>
          Browse File
          <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={onInputChange} />
        </Button>
        <Box mt={1}>
          {['.xlsx', '.xls', '.csv'].map(ext => (
            <Chip key={ext} label={ext} size="small" sx={{ mx: 0.5 }} />
          ))}
        </Box>
      </Box>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => dispatch(clearUploadState())}>{error}</Alert>}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />} onClose={() => dispatch(clearUploadState())}>
          {successMessage}
        </Alert>
      )}
    </Paper>
  );
}
