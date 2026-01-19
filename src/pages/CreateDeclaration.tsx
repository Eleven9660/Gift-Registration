import React, { useState } from 'react';
import { 
  Paper, Typography, Box, TextField, Grid, MenuItem, Button, 
  FormControl, InputLabel, Select, FormHelperText, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { client } from '../client';
import { useNavigate } from 'react-router-dom';

const CreateDeclaration = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    direction: 'RECEIVED',
    giftType: 'PHYSICAL',
    description: '',
    estimatedValue: '',
    giftDate: new Date().toISOString().split('T')[0],
    counterpartyName: '',
    counterpartyOrg: '',
    counterpartyRelationship: '',
    justification: '',
  });

  const steps = ['Gift Details', 'Counterparty Info', 'Review & Submit'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { errors } = await client.models.Declaration.create({
        direction: formData.direction as any,
        giftType: formData.giftType as any,
        status: 'SUBMITTED', // Auto-submit? Or Draft? Let's say Submitted.
        description: formData.description,
        estimatedValue: parseFloat(formData.estimatedValue),
        giftDate: formData.giftDate,
        counterpartyName: formData.counterpartyName,
        counterpartyOrg: formData.counterpartyOrg,
        counterpartyRelationship: formData.counterpartyRelationship,
        justification: formData.justification
      });

      if (errors) throw new Error(errors[0].message);

      navigate('/history');
    } catch (err: any) {
      setError(err.message || "Failed to submit declaration");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.description && formData.estimatedValue;
  const isStep2Valid = formData.counterpartyName && formData.counterpartyOrg;

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" gutterBottom fontWeight="bold">Declare a Gift</Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 4 }}>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Direction</InputLabel>
                <Select
                  name="direction"
                  value={formData.direction}
                  label="Direction"
                  onChange={handleChange as any}
                >
                  <MenuItem value="RECEIVED">Received (I got it)</MenuItem>
                  <MenuItem value="ISSUED">Issued (I gave it)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gift Type</InputLabel>
                <Select
                  name="giftType"
                  value={formData.giftType}
                  label="Gift Type"
                  onChange={handleChange as any}
                >
                  <MenuItem value="CASH">Cash / Cash Equivalent</MenuItem>
                  <MenuItem value="PHYSICAL">Physical Item</MenuItem>
                  <MenuItem value="IN_KIND">In Kind (Service/Hospitality)</MenuItem>
                </Select>
                {formData.giftType === 'CASH' && (
                  <FormHelperText error>Cash gifts are generally prohibited and strictly flagged.</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="E.g., Bottle of wine, Dinner at Kempinski"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Value (KES)"
                name="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="giftDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.giftDate}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Counterparty Name"
                name="counterpartyName"
                value={formData.counterpartyName}
                onChange={handleChange}
                helperText="Who gave/received the gift?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization"
                name="counterpartyOrg"
                value={formData.counterpartyOrg}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship"
                name="counterpartyRelationship"
                value={formData.counterpartyRelationship}
                onChange={handleChange}
                placeholder="e.g., Supplier, Client, Government Official"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Justification / Context"
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Why was this gift given/received?"
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}><Typography color="text.secondary">Type:</Typography></Grid>
              <Grid item xs={8}><Typography fontWeight="bold">{formData.direction} - {formData.giftType}</Typography></Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Item:</Typography></Grid>
              <Grid item xs={8}><Typography>{formData.description}</Typography></Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Value:</Typography></Grid>
              <Grid item xs={8}><Typography>KES {formData.estimatedValue}</Typography></Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Counterparty:</Typography></Grid>
              <Grid item xs={8}><Typography>{formData.counterpartyName} ({formData.counterpartyOrg})</Typography></Grid>
            </Grid>
            
            <Alert severity="warning" sx={{ mt: 3 }}>
              By submitting this form, you declare that the information provided is true and complete to the best of your knowledge, in compliance with the Company Anti-Bribery Policy.
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={(activeStep === 0 && !isStep1Valid) || (activeStep === 1 && !isStep2Valid)}
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Declaration'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateDeclaration;
