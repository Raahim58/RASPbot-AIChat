import { useState, useEffect, useRef } from "react";
import { FaGithub, FaLinkedin, FaYoutube, FaCopy, FaBlog } from 'react-icons/fa';
import "./index.css";

const Header = () => (
  <header className="header">
    <img className="image" src="logo192.png" alt="Logo" />
    <span className="title">
      <span className="rasp" style={{ color: '#FF69B4' }}>RASP</span>
      <span className="bot" style={{ color: '#FFFFC4' }}>bot</span>
    </span>
    <style jsx>{`
      .image {
        width: 40px;
        height: 40px;
        borderRadius: '50%'; 
        margin: 10px;
      }
      .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
      }
      .title {
        font-size: 40px;
        font-weight: 900;
        margin: 10px;
      }
      @media (max-width: 1300px) {
        .title {
          font-size: 24px;
        }
      }
    `}</style>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <div className="icons">
      <a href="https://github.com/Raahim58/" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
      <a href="https://linkedin.com/in/raahim-poonawala" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
      <a href="https://www.youtube.com/channel/UCCgYjtpAbT5_PQEYJlt3pCg" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
      <a href="https://tllai1.wixsite.com/raahim/home" target="_blank" rel="noopener noreferrer"><FaBlog /></a>
    </div>
    <div className="copyright">
      <span>©2024 All rights reserved by Raahim Poonawala</span>
    </div>
    <style jsx>{`
      .footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 0px;
      }
      .icons {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 5px;
      }
      .icons a {
        color: #fff;
        font-size: 25px;
        margin: 0px 10px;
        transition: color 0.3s;
      }
      .icons a:hover {
        color: #0056b3;
      }
      .copyright {
        font-size: 15px;
        text-align: center;
        margin: 0px;
        color: #fff;
      }
      @media (max-width: 1300px) {
        .icons {
          flex-direction: row;
          margin: 5px;
        }
        .icons a {
          font-size: 24px;
          margin: 5px;
        }
        .copyright {
          font-size: 12px;
        }
      }
    `}</style>
  </footer>
);

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showPrompts, setShowPrompts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const searchResultRef = useRef(null);

  const surpriseOptions = [
    'Is it really worth it?',
    'Make me an itenary for a trip to Norway',
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
      const formattedData = data.replace(/\*([^\*]+)\*/g, "<b>$1</b>").replace(/\n/g, "<br/>");
      const newChatHistory = [
        ...chatHistory, 
        {
          role: "user",
          parts: [{ text: value }]
        },
        {
          role: "model",
          parts: [{ text: formattedData }]
        }
      ];
      setChatHistory(newChatHistory);
      localStorage.setItem('chatHistory', JSON.stringify(newChatHistory));
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
    localStorage.removeItem('chatHistory');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getResponse();
    }
  };

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
      setShowPrompts(false);
    }
  }, []);

  useEffect(() => {
    if (searchResultRef.current) {
      searchResultRef.current.scrollTop = searchResultRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessage("Copied to clipboard!");
      setTimeout(() => {
        setCopyMessage("");
      }, 5000);
    });
  };

  return (
    <>
      <Header />
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
            rows="10"
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
                <button className="copy-button rounded-lg" onClick={() => copyToClipboard(chatItem.parts.map(part => part.text).join(', '))}>
                  <FaCopy />
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
        {copyMessage && <div className="copy-message">{copyMessage}</div>}
      </div>
      <Footer />
    </>
  );
}

export default App;


