import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMyParkings } from '../services/parking';
import { IParking } from '../types/index';

export const DashboardPage = () => {
  const [parkings, setParkings] = useState<IParking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        await getMyParkings({
          setLoading,
          setParkings,
        });
      } catch (error) {
        console.error('Error fetching parkings:', error);
      }
    };

    fetchParkings();
  }, []);

  const handleViewParking = (parkingId: number) => {
    navigate(`/parking/${parkingId}`);
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
        Parking Facilities Overview
      </Typography>
      <Grid container spacing={3}>
        {parkings.map((parking) => (
          <Grid item xs={12} sm={6} md={4} key={parking.id}>
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
              onClick={() => handleViewParking(parking.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {parking.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {parking.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {parking.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Spaces: {parking.availableSpaces}/{parking.totalSpaces}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
