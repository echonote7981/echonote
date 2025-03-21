const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Path to a sample audio file
const sampleAudioPath = path.resolve(__dirname, '../../../sample-audio.mp3');

// Create a sample audio file if it doesn't exist
const createSampleAudio = async () => {
  if (!fs.existsSync(sampleAudioPath)) {
    console.log('Creating sample audio file...');
    // Create a tiny MP3 file
    const buffer = Buffer.from([255, 251, 48, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    fs.writeFileSync(sampleAudioPath, buffer);
    console.log('Sample audio file created at:', sampleAudioPath);
  } else {
    console.log('Sample audio file already exists at:', sampleAudioPath);
  }
};

// Test upload
const testUpload = async () => {
  try {
    await createSampleAudio();
    
    const url = 'http://localhost:3000/api/meetings';
    const formData = new FormData();
    
    formData.append('title', 'Test Audio Upload');
    formData.append('duration', '10');
    formData.append('audio', fs.createReadStream(sampleAudioPath));
    
    console.log('Sending test upload request...');
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('Upload response:', response.status);
    console.log('Meeting created:', response.data);
    
    // Now try to retrieve the audio
    if (response.data && response.data.id) {
      const audioUrl = `http://localhost:3000/api/meetings/${response.data.id}/audio`;
      console.log('Testing audio retrieval from:', audioUrl);
      
      try {
        const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
        console.log('Audio retrieval successful:', audioResponse.status);
        console.log('Headers:', audioResponse.headers);
        
        // Write to a test file to verify content
        const testOutputPath = path.resolve(__dirname, '../../../test-output.mp3');
        const writer = fs.createWriteStream(testOutputPath);
        audioResponse.data.pipe(writer);
        
        writer.on('finish', () => {
          console.log('Test output written to:', testOutputPath);
          const stats = fs.statSync(testOutputPath);
          console.log('File size:', stats.size, 'bytes');
        });
        
        writer.on('error', (err) => {
          console.error('Error writing test output:', err);
        });
      } catch (error) {
        console.error('Error retrieving audio:', error.message);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        }
      }
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  }
};

testUpload().catch(console.error);
