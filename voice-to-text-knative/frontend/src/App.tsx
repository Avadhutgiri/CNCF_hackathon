import { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if the file is an audio file
    if (!file.type.startsWith('audio/')) {
      setTranscription('Error: Please upload an audio file');
      return;
    }

    // Check if the file is .wav or .mp3
    if (!file.name.toLowerCase().endsWith('.wav') && !file.name.toLowerCase().endsWith('.mp3')) {
      setTranscription('Error: Only .wav or .mp3 files are supported');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/audio-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.text || 'No text was transcribed');
    } catch (error) {
      console.error('Error uploading file:', error);
      setTranscription(`Error: ${error instanceof Error ? error.message : 'Could not transcribe audio'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Voice to Text
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: 3,
              width: '100%',
              maxWidth: 600,
              mb: 4,
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {transcription || 'Your transcription will appear here...'}
              </Typography>
            )}
          </Paper>

          <input
            type="file"
            accept=".wav,.mp3"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CloudUploadIcon />}
            onClick={handleButtonClick}
            sx={{ borderRadius: 28 }}
          >
            Upload Audio File
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 