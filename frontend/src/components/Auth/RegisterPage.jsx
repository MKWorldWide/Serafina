import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import useStore from '../../store/useStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <Container maxWidth='sm'>
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom align='center'>
            Join GameDin
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label='Username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              margin='normal'
              required
            />
            <TextField
              fullWidth
              label='Email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              margin='normal'
              required
            />
            <TextField
              fullWidth
              label='Password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              margin='normal'
              required
            />
            <TextField
              fullWidth
              label='Confirm Password'
              name='confirmPassword'
              type='password'
              value={formData.confirmPassword}
              onChange={handleChange}
              margin='normal'
              required
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
