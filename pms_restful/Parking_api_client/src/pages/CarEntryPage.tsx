import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Grid, Select, MenuItem } from '@mui/material';
import { useAuth } from '../context/auth';

interface ParkingLot {
  id: number;
  parkingCode: string;
  name: string;
  availableSpaces: number;
}

export const CarEntryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    parkingCode: '',
    parkingLot: null as number | null,
  });
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/parking-session/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: formData.plateNumber,
          parkingCode: formData.parkingCode,
          parkingLotId: formData.parkingLot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create parking session');
      }

      const data = await response.json();
      navigate(`/ticket/${data.ticketId}`);
    } catch (err) {
      setError('Failed to create parking session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParkingLots = useCallback(async () => {
    try {
      const response = await fetch('/api/parking-lots/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }

      const data = await response.json();
      setParkingLots(data.parkingLots);
    } catch (err) {
      setError('Failed to fetch parking lots. Please try again.');
    }
  }, [token]);

  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Car Entry Registration
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Plate Number"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Parking Code"
                  name="parkingCode"
                  value={formData.parkingCode}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Parking Lot"
                  name="parkingLot"
                  value={formData.parkingLot}
                  onChange={handleChange}
                  required
                >
                  {parkingLots.map(lot => (
                    <MenuItem key={lot.id} value={lot.id}>
                      {lot.name} ({lot.availableSpaces} spaces available)
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Register Entry'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
