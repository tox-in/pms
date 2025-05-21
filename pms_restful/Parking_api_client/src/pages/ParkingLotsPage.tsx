import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAvailableParkingLots } from '../services/parking';
import { IParkingLot } from '../types';

export const ParkingLotsPage = () => {
  const [parkingLots, setParkingLots] = useState<IParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const lots = await getAvailableParkingLots();
        setParkingLots(lots);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parking lots:', error);
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  const handleReserveLot = (lotId: number) => {
    navigate(`/reserve/${lotId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Parking Lots
      </Typography>
      <Grid container spacing={3}>
        {parkingLots.map((lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 8,
                },
              }}
              onClick={() => handleReserveLot(lot.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lot {lot.lotNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {lot.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vehicle Type: {lot.vehicleType}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserveLot(lot.id);
                    }}
                  >
                    Reserve
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
