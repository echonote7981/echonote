const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Meeting } = require('../models');

// Test OpenAI API access
async function testOpenAIAccess() {
  try {
    console.log('Testing OpenAI API access...');
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    console.log('OpenAI API access successful:', {
      status: response.status,
      models: response.data.data.length
    });
    return true;
  } catch (error) {
    console.error('OpenAI API access failed:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return false;
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transcribeWithRetry(formData, headers, retries = MAX_RETRIES) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    return response.data.text;
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      console.log(`Rate limited, retrying in ${RETRY_DELAY/1000} seconds... (${retries} retries left)`);
      await sleep(RETRY_DELAY);
      return transcribeWithRetry(formData, headers, retries - 1);
    }
    throw error;
  }
}

async function transcribeAudio(filePath, meetingId) {
  let fileStream;
  try {
    console.log('Starting transcription for meeting:', meetingId);
    console.log('Audio file path:', filePath);
    
    // Test OpenAI API access first
    const apiAccessible = await testOpenAIAccess();
    if (!apiAccessible) {
      throw new Error('Cannot access OpenAI API. Please check your API key and network connection.');
    }

    // Verify file exists and is readable
    await fs.promises.access(filePath, fs.constants.R_OK);
    const stats = await fs.promises.stat(filePath);
    console.log('File size:', stats.size, 'bytes');
    console.log('File exists and is readable');

    // Create form data
    const formData = new FormData();
    fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      ...formData.getHeaders(),
    };

    console.log('Sending request to OpenAI Whisper API...');
    console.log('Request headers:', {
      Authorization: 'Bearer sk-....' + process.env.OPENAI_API_KEY.slice(-4),
      ...formData.getHeaders(),
    });

    const transcript = await transcribeWithRetry(formData, headers);
    console.log('Received transcript from Whisper API');
    console.log('Transcript length:', transcript?.length || 0, 'characters');

    // Update meeting with transcript
    const meeting = await Meeting.findByPk(meetingId);
    if (meeting) {
      console.log('Updating meeting with transcript');
      meeting.transcript = transcript;
      meeting.status = 'processed';
      await meeting.save();

      // Generate summary and update meeting
      console.log('Generating summary from transcript');
      const { summary, highlights } = await generateSummary(transcript);
      console.log('Summary generated:', { 
        summaryLength: summary?.length || 0,
        highlightsCount: highlights?.length || 0 
      });

      meeting.summary = summary;
      meeting.highlights = highlights;
      await meeting.save();
      console.log('Meeting updated successfully');
    } else {
      console.error('Meeting not found:', meetingId);
    }

    return transcript;
  } catch (error) {
    console.error('Transcription error details:', {
      message: error.message,
      stack: error.stack,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
      request: {
        method: error.config?.method,
        url: error.config?.url,
      }
    });

    // Update meeting status to failed with a more descriptive error message
    try {
      const meeting = await Meeting.findByPk(meetingId);
      if (meeting) {
        meeting.status = 'failed';
        meeting.error = error.response?.status === 429 
          ? 'OpenAI API rate limit exceeded. Please try again in a few minutes.'
          : `Transcription failed: ${error.message}`;
        await meeting.save();
        console.log('Updated meeting status to failed');
      }
    } catch (updateError) {
      console.error('Failed to update meeting status:', updateError);
    }

    throw error;
  } finally {
    // Always clean up the file stream
    if (fileStream) {
      fileStream.destroy();
    }
  }
}

async function generateSummary(transcript) {
  try {
    console.log('Generating summary using GPT-4');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a meeting summarizer. Create a concise summary and extract key highlights from the transcript.',
          },
          {
            role: 'user',
            content: `Please provide a summary and list of key highlights from this transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    const highlights = extractHighlights(summary);

    return { summary, highlights };
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
}

function extractHighlights(summary) {
  // Extract bullet points or numbered items from the summary
  const highlights = summary
    .split('\n')
    .filter(line => line.trim().match(/^[-•*]|\d+\./))
    .map(line => line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim());

  return highlights;
}

module.exports = {
  transcribeAudio,
  generateSummary,
  testOpenAIAccess,
};
