import { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button
} from '@mui/material';
import { client } from '../client';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DeclarationList = () => {
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const { data } = await client.models.Declaration.list();
      // Sort by date desc
      const sorted = data.sort((a, b) => new Date(b.giftDate).getTime() - new Date(a.giftDate).getTime());
      setDeclarations(sorted);
    } catch (error) {
      console.error("Error fetching declarations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'UNDER_REVIEW': return 'warning';
      case 'SUBMITTED': return 'info';
      default: return 'default';
    }
  };

  const handleExportCSV = () => {
    if (declarations.length === 0) return;

    const headers = ['Date', 'Direction', 'Type', 'Description', 'Value', 'Counterparty', 'Org', 'Status'];
    const csvContent = [
      headers.join(','),
      ...declarations.map(row => [
        row.giftDate,
        row.direction,
        row.giftType,
        `"${row.description.replace(/"/g, '""')}"`, // Escape quotes
        row.estimatedValue,
        `"${row.counterpartyName}"`,
        `"${row.counterpartyOrg}"`,
        row.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `gift_declarations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">My History</Typography>
        <Button variant="outlined" onClick={handleExportCSV} disabled={declarations.length === 0}>
            Export CSV
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Counterparty</TableCell>
              <TableCell>Value (KES)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {declarations.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.giftDate}</TableCell>
                <TableCell>
                    <Box>
                        <Typography variant="body2" fontWeight="bold">{row.direction} - {row.giftType}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.description}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{row.counterpartyName} ({row.counterpartyOrg})</TableCell>
                <TableCell>{row.estimatedValue.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status.replace('_', ' ')} 
                    color={getStatusColor(row.status) as any} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && declarations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No declarations found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DeclarationList;
