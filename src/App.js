import { useState } from "react";

const App = () => {
  const [ value, setValue ] = useState("");
  const [ error, setError] = useState("");
  const [ chatHistory, setChatHistory] = useState([]);

  const surpriseOptions = [
    'Who won the latest Nobel Peace Prize?',
    'Where does pizza come from?',
    'How do you make a samosa?',
    'How much GPA does one require to get into Harvard for Masters in Data Science?'
  ]

  const surprise = () => {
    const randomValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setValue(randomValue)
  }

  const getResponse = async () => {
    if (!value) {
      setError("Error! Please ask a question!");
      return;
    }
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const response = await fetch('http://localhost:8000/gemini', options)
      const data = await response.text();
      console.log(data);
      setChatHistory(oldChatHistory => [...oldChatHistory, {
        role: "user",
        parts: [{ text: value }]
      },
      {
        role: "model",
        parts: [{ text: data }]
      }]);
      setValue("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong! Please try again.");
    }
  }

  const clear = () => {
    setValue("")
    setError("")
    setChatHistory([])
  }

  return (
    <div className="App">
      <p>What do you want to know?
        <button className="surprise" onClick={surprise} disabled = {!chatHistory}>Surprise me</button>
      </p>
      <div className="input-container">
        <input 
          value = {value}
          placeholder = "When is christmas...?"
          onChange={(e) => setValue(e.target.value)}
        />
        {!error && <button onClick={getResponse}>Ask me</button>}
        {error && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p>{error}</p>}
      <div className="search-result">
      {chatHistory.map((chatItem, _index) => (
        <div key={_index}>
          <p className="answer">{chatItem.role} : {chatItem.parts.map(part => part.text).join(', ')}</p>
        </div>
      ))}
      </div>
    </div>
  );
}

export default App;
