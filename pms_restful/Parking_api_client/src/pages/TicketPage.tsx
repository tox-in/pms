import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper, Typography, Grid, Button } from '@mui/material';

interface TicketData {
  ticketId: string;
  plateNumber: string;
  parkingCode: string;
  entryTime: string;
  exitTime?: string;
  amountCharged?: number;
  duration?: string;
}

export const TicketPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id: string) => {
    try {
      const response = await fetch(`/api/parking-session/ticket/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      setError('Failed to fetch ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    try {
      const response = await fetch(`/api/parking-session/exit/${ticketId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to process exit');
      }

      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      setError('Failed to process exit. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 8 }}>
          <Typography>Loading ticket...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 8 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container>
        <Box sx={{ mt: 8 }}>
          <Typography>Ticket not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Parking Ticket
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Ticket ID: {ticket.ticketId}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Plate Number: {ticket.plateNumber}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Parking Code: {ticket.parkingCode}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Entry Time: {ticket.entryTime}</Typography>
            </Grid>
            {ticket.exitTime && (
              <Grid item xs={12}>
                <Typography variant="h6">Exit Time: {ticket.exitTime}</Typography>
              </Grid>
            )}
            {ticket.duration && (
              <Grid item xs={12}>
                <Typography variant="h6">Duration: {ticket.duration}</Typography>
              </Grid>
            )}
            {ticket.amountCharged !== undefined && (
              <Grid item xs={12}>
                <Typography variant="h6">
                  Amount Charged: ${ticket.amountCharged.toFixed(2)}
                </Typography>
              </Grid>
            )}
          </Grid>

          {!ticket.exitTime && (
            <Button
              onClick={handleExit}
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              Process Exit
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
