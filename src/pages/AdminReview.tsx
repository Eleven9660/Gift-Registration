import { useEffect, useState } from 'react';
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { client } from '../client';
import { useAuthenticator } from '@aws-amplify/ui-react';

const AdminReview = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [selectedDecl, setSelectedDecl] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Simple role check (In real app, use route guards)
  // We assume if the backend allows the list call, they are authorized.
  // But for UI, let's check groups if available in token (complex to parse here without helper).
  // We'll rely on backend errors.

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      // In a real app with many records, we'd use a GSI with Status as the key.
      // Here we scan/filter client side for MVP or use filter in list.
      const { data } = await client.models.Declaration.list({
        filter: {
            or: [
                { status: { eq: 'SUBMITTED' } },
                { status: { eq: 'UNDER_REVIEW' } }
            ]
        }
      });
      setDeclarations(data);
    } catch (error) {
      console.error("Error fetching pending:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = (decl: any) => {
    setSelectedDecl(decl);
    setReviewComment('');
  };

  const submitDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedDecl) return;

    try {
        // 1. Update Declaration Status
        await client.models.Declaration.update({
            id: selectedDecl.id,
            status: decision
        });

        // 2. Create Review Record
        await client.models.Review.create({
            declarationId: selectedDecl.id,
            decision: decision,
            comment: reviewComment,
            reviewerId: user.username
        });

        fetchPending();
        setSelectedDecl(null);
    } catch (e) {
        console.error("Error processing:", e);
        alert("Failed to process. Ensure you are in the 'Compliance' or 'Admin' group.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">Compliance Review Queue</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Justification</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {declarations.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                    {/* Owner is not directly exposed in default selection set usually, depends on schema depth */}
                    {/* We might need to fetch it or rely on a field we added. The schema has 'owner' auth rule which adds 'owner' field implicitly often */}
                    {row.owner || "Employee"}
                </TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{row.direction} - {row.giftType}</Typography>
                    <Typography variant="caption">{row.description}</Typography>
                    <Box mt={0.5}>
                        <Chip label={`${row.counterpartyName} (${row.counterpartyOrg})`} size="small" variant="outlined" />
                    </Box>
                </TableCell>
                <TableCell>KES {row.estimatedValue.toLocaleString()}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" noWrap>{row.justification}</Typography>
                </TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleProcess(row)}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
             {!loading && declarations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No pending reviews.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedDecl} onClose={() => setSelectedDecl(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Declaration</DialogTitle>
        <DialogContent>
            {selectedDecl && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Item: {selectedDecl.description}</Typography>
                    <Typography variant="subtitle2">Value: KES {selectedDecl.estimatedValue}</Typography>
                    <Typography variant="subtitle2" gutterBottom>Context: {selectedDecl.justification}</Typography>
                    
                    <TextField 
                        fullWidth 
                        label="Review Comments" 
                        multiline 
                        rows={3} 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setSelectedDecl(null)}>Cancel</Button>
            <Button onClick={() => submitDecision('REJECTED')} color="error">Reject</Button>
            <Button onClick={() => submitDecision('APPROVED')} color="success" variant="contained">Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReview;
