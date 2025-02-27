const OpenAI = require('openai');
const fs = require('fs');
const { Meeting } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeAudio(filePath, meetingId) {
  try {
    // 1. Transcribe audio using Whisper API
    const fileStream = fs.createReadStream(filePath);
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
    });

    // 2. Generate summary and highlights using GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a meeting assistant. Analyze the following meeting transcript and provide:
            1. A concise summary
            2. Key highlights (as a list)
            3. Action items (as a list with due dates)
            Format the response in JSON.`
        },
        {
          role: 'user',
          content: transcription.text
        }
      ]
    });

    // 3. Parse the GPT response
    const analysis = JSON.parse(completion.choices[0].message.content);

    // 4. Update meeting with transcription and analysis
    await Meeting.update({
      transcript: transcription.text,
      summary: analysis.summary,
      highlights: analysis.highlights,
      status: 'processed'
    }, {
      where: { id: meetingId }
    });

    // 5. Create action items
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      const { Action } = require('../models');
      for (const item of analysis.actionItems) {
        await Action.create({
          title: item.title,
          meetingId,
          dueDate: item.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
          priority: item.priority || 'Medium',
          status: 'pending',
          notes: item.notes
        });
      }
    }

    return {
      transcript: transcription.text,
      summary: analysis.summary,
      highlights: analysis.highlights,
      actionItems: analysis.actionItems
    };
  } catch (error) {
    console.error('Transcription error:', error);
    await Meeting.update({
      status: 'failed'
    }, {
      where: { id: meetingId }
    });
    throw error;
  }
}

module.exports = {
  transcribeAudio
};
