import { useState, useEffect, useRef } from "react";

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showPrompts, setShowPrompts] = useState(true);
  const [loading, setLoading] = useState(false);
  const searchResultRef = useRef(null);

  const surpriseOptions = [
    'Who won the latest Nobel Peace Prize?',
    'Where does pizza come from?',
    'How do you make a samosa?',
    'How much GPA does one require to get into Harvard for Masters in Data Science?'
  ];

  const surprise = (option) => {
    setValue(option);
  };

  const getResponse = async () => {
    if (!value) return;

    setError("");
    setLoading(true);
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
      };
      const response = await fetch('http://localhost:8000/gemini', options);
      const data = await response.text();
      setChatHistory(oldChatHistory => [
        ...oldChatHistory, 
        {
          role: "user",
          parts: [{ text: value }]
        },
        {
          role: "model",
          parts: [{ text: data.replace(/\*([^\*]+)\*/g, "<b>$1</b>").replace(/\n/g, "<br/>") }]
        }
      ]);
      setValue("");
      setShowPrompts(false);
    } catch (error) {
      console.error(error);
      setError("Something went wrong! Please try again.");
    }
    setLoading(false);
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
    setShowPrompts(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getResponse();
    }
  };

  useEffect(() => {
    if (searchResultRef.current) {
      searchResultRef.current.scrollTop = searchResultRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="app">
      {showPrompts && (
        <div className="prompts">
          {surpriseOptions.map((option, index) => (
            <button key={index} className="surprise" onClick={() => surprise(option)}>{option}</button>
          ))}
        </div>
      )}
      <div className="input-container">
        <input 
          value={value}
          placeholder="chat away..."
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={getResponse} disabled={!value}>
          Ask me
        </button>
        {chatHistory.length > 0 && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p>{error}</p>}
      <div className="search-result" ref={searchResultRef}>
        {chatHistory.length === 0 && !loading && (
          <div className="no-chat"><span style={{color: "lightgreen"}}>Hello, <br /> what can I do for you today?</span></div>
        )}
        {chatHistory.map((chatItem, index) => (
          <div key={index} className={`answer ${chatItem.role}`}>
            <div dangerouslySetInnerHTML={{ __html: chatItem.parts.map(part => part.text).join(', ') }} />
            {chatItem.role === "model" && (
              <button className="copy-button" onClick={() => copyToClipboard(chatItem.parts.map(part => part.text).join(', '))}>
                <i className="fas fa-copy" aria-hidden="true"></i>
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="answer">
            <div className="loading"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
