const express = require('express');
const asyncHandler = require('express-async-handler');
const { Meeting, Action, ArchivedMeeting } = require('../models');
const { transcribeAudio, generateSummary } = require('../services/transcription');
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/audio');
mkdirp.sync(uploadsDir);

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Ensure unique filename with timestamp and original extension
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const uploadMulter = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log('Received file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      size: file.size
    });

    // Accept any audio file type
    if (file.mimetype.startsWith('audio/') || 
        file.originalname.match(/\.(m4a|mp3|wav|aac|m4r)$/i)) {
      cb(null, true);
    } else {
      console.error('Invalid file type:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all meetings
router.get('/', asyncHandler(async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      order: [['date', 'DESC']],
      include: [{
        model: Action,
        as: 'actions',
        required: false
      }]
    });
    res.json(meetings);
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
}));

// Get all archived meetings
router.get('/archived', asyncHandler(async (req, res) => {
  try {
    console.log('Fetching archived meetings');
    const archivedMeetings = await ArchivedMeeting.findAll({
      order: [['date', 'DESC']]
    });
    console.log('Found archived meetings:', archivedMeetings.length);
    res.json(archivedMeetings);
  } catch (error) {
    console.error('Failed to fetch archived meetings:', error);
    res.status(500).json({ message: 'Failed to fetch archived meetings', error: error.message });
  }
}));

// Get single meeting
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [{
        model: Action,
        as: 'actions',
        required: false
      }]
    });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    res.status(500).json({ message: 'Failed to fetch meeting', error: error.message });
  }
}));
// Get meeting audio file
router.get('/:id/audio', asyncHandler(async (req, res) => {
  try {
    console.log('Audio request received for meeting:', req.params.id);
    console.log('Query parameters:', req.query);
    
    const meeting = await Meeting.findByPk(req.params.id);
    
    if (!meeting) {
      console.error('Meeting not found:', req.params.id);
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (!meeting.audioUrl) {
      console.error('No audio URL for meeting:', req.params.id);
      return res.status(404).json({ message: 'Audio file not found for this meeting' });
    }
    
    console.log('Database audioUrl path:', meeting.audioUrl);
    
    // Get absolute path and check if file exists
    const absolutePath = meeting.audioUrl;
    
    try {
      await fs.access(absolutePath, fs.constants.R_OK);
      console.log('File exists and is readable');
      
      // Get file info
      const stats = await fs.stat(absolutePath);
      console.log('File size:', stats.size, 'bytes');
      
      // Determine correct content type based on file extension
      const ext = path.extname(absolutePath).toLowerCase();
      let contentType = 'audio/mpeg'; // default
      
      if (ext === '.m4a') contentType = 'audio/mp4';
      else if (ext === '.wav') contentType = 'audio/wav';
      else if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.aac') contentType = 'audio/aac';
      
      console.log('Content type:', contentType);
      
      // Handle range requests for better streaming support
      const range = req.headers.range;
      
      if (range) {
        console.log('Range request received:', range);
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        
        console.log('Streaming range:', { start, end, chunksize });
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        });
        
        const fileStream = require('fs').createReadStream(absolutePath, { start, end });
        fileStream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error streaming audio file' });
          }
        });
        
        fileStream.pipe(res);
      } else {
        // Set headers for full file streaming
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        });
        
        // Stream the file using standard fs (not promises)
        const fileStream = require('fs').createReadStream(absolutePath);
        
        fileStream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error streaming audio file' });
          }
        });
        
        fileStream.pipe(res);
      }
    } catch (error) {
      console.error(`Audio file not found or not readable: ${absolutePath}`, error);
      
      // If the raw parameter is set or if this is a retry attempt, try to send a test audio file instead
      if (req.query.raw === 'true' || req.query.fallback === 'true') {
        console.log('Attempting to send test audio file');
        try {
          // Try multiple possible paths for the test audio file
          const possiblePaths = [
            path.join(__dirname, '../../uploads/test-audio.mp3'),
            path.join(__dirname, '../../../uploads/test-audio.mp3'),
            path.join(process.cwd(), 'backend/uploads/test-audio.mp3'),
            path.join(process.cwd(), 'uploads/test-audio.mp3')
          ];
          
          // Log all paths we're checking
          console.log('Checking test audio file paths:', possiblePaths);
          
          // Find the first path that exists
          let testAudioPath = null;
          for (const p of possiblePaths) {
            if (require('fs').existsSync(p)) {
              testAudioPath = p;
              console.log('Found test audio file at:', testAudioPath);
              break;
            }
          }
          
          if (testAudioPath) {
            // Get file stats for headers
            const stats = require('fs').statSync(testAudioPath);
            
            // Set appropriate headers
            res.writeHead(200, {
              'Content-Type': 'audio/mpeg',
              'Content-Length': stats.size,
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
            });
            
            // Stream the test file
            const testStream = require('fs').createReadStream(testAudioPath);
            testStream.on('error', (streamError) => {
              console.error('Error streaming test audio:', streamError);
              if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming test audio file' });
              }
            });
            
            return testStream.pipe(res);
          } else {
            console.error('Test audio file not found in any of the expected locations');
          }
        } catch (testError) {
          console.error('Failed to serve test audio:', testError);
        }
      }
      
      return res.status(404).json({ 
        message: 'Audio file not found on server', 
        path: absolutePath,
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Failed to fetch audio:', error);
    res.status(500).json({ message: 'Failed to fetch audio', error: error.message });
  }
}));

// Create new meeting with audio upload
router.post('/', uploadMulter.single('audio'), asyncHandler(async (req, res) => {
  try {
    console.log('Creating new meeting...');
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
      console.error('No audio file provided');
      return res.status(400).json({ message: 'No audio file provided' });
    }

    if (!req.body.title) {
      console.error('No title provided');
      await fs.unlink(req.file.path); // Clean up uploaded file
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.body.duration) {
      console.error('No duration provided');
      await fs.unlink(req.file.path); // Clean up uploaded file
      return res.status(400).json({ message: 'Duration is required' });
    }

    // Verify the file exists and is readable
    try {
      await fs.access(req.file.path, fs.constants.R_OK);
      const stats = await fs.stat(req.file.path);
      console.log('Audio file details:', {
        path: req.file.path,
        size: stats.size,
        created: stats.birthtime
      });
    } catch (error) {
      console.error('File verification failed:', error);
      return res.status(500).json({ message: 'Failed to verify uploaded file' });
    }

    console.log('Creating meeting in database with data:', {
      title: req.body.title,
      date: new Date(),
      duration: parseInt(req.body.duration),
      audioUrl: req.file.path,
      status: 'processing'
    });

    const meeting = await Meeting.create({
      title: req.body.title,
      date: new Date(),
      duration: parseInt(req.body.duration),
      audioUrl: req.file.path,
      status: 'processing',
    });

    console.log('Meeting created successfully:', meeting.toJSON());

    // Process audio in background
    transcribeAudio(req.file.path, meeting.id)
      .catch(error => {
        console.error('Background processing failed:', error);
        console.error('Error stack:', error.stack);
      });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Upload failed:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if it exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to create meeting',
      error: error.message 
    });
  }
}));

// Archive a meeting
router.post('/:id/archive', async (req, res) => {
  try {
    console.log('Archiving meeting with ID:', req.params.id);
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      console.log('Meeting not found:', req.params.id);
      return res.status(404).json({ message: 'Meeting not found' });
    }

    console.log('Found meeting:', meeting.toJSON());

    // Create archived meeting record
    const archivedMeeting = await ArchivedMeeting.create({
      originalMeetingId: meeting.id,
      title: meeting.title,
      date: meeting.date,
      duration: meeting.duration,
      transcript: meeting.transcript,
      audioUrl: meeting.audioPath,
      highlights: []
    });

    console.log('Created archived meeting:', archivedMeeting.toJSON());

    // Delete original meeting
    await meeting.destroy();
    console.log('Deleted original meeting');

    res.json({ message: 'Meeting archived successfully', archivedMeeting });
  } catch (error) {
    console.error('Error archiving meeting:', error);
    res.status(500).json({ message: 'Error archiving meeting', error: error.message });
  }
});

// Update meeting
router.put('/:id', asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByPk(req.params.id);
  
  if (!meeting) {
    res.status(404).json({ message: 'Meeting not found' });
    return;
  }

  await meeting.update(req.body);
  res.json(meeting);
}));

// Delete a meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Delete associated audio file if it exists
    if (meeting.audioPath) {
      try {
        await fs.unlink(meeting.audioPath);
      } catch (error) {
        console.error('Failed to delete audio file:', error);
      }
    }

    await meeting.destroy();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    res.status(500).json({ message: 'Failed to delete meeting', error: error.message });
  }
});

// Helper function to process audio files
async function processAudio(meetingId, audioPath) {
  try {
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) return;

    // Transcribe audio
    const transcript = await transcribeAudio(audioPath);
    
    // Generate summary and highlights
    const { summary, highlights } = await generateSummary(transcript);

    // Update meeting with processed information
    await meeting.update({
      transcript,
      summary,
      highlights,
      status: 'processed',
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    await Meeting.update(
      { status: 'failed' },
      { where: { id: meetingId } }
    );
  }
}

module.exports = router;
