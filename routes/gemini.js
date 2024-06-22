const processGeminiRequest = async (history, message) => {
    // to process the request and return a response
    const response = `You said: ${message}. History: ${history.join(', ')}.`;
    return response;
  };
  
  router.post('/gemini', async (req, res) => {
    try {
      const { history, message } = req.body;
      const response = await processGeminiRequest(history, message);
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  });