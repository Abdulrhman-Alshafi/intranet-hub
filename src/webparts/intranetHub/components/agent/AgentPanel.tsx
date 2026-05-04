import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AgentPanel.module.scss';

interface IChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SUGGESTIONS = [
  { icon: '📅', text: "What's happening this week?" },
  { icon: '📋', text: 'Find company policies' },
  { icon: '💻', text: 'Who can help with IT support?' },
  { icon: '📊', text: 'Show me payroll calendar' },
  { icon: '✈️', text: 'How do I request PTO?' },
];

const AgentPanel: React.FC = () => {
  const [messages, setMessages] = React.useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string): void => {
    const msg = text || inputValue.trim();
    if (!msg) return;

    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      text: msg,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Demo response after delay
    setTimeout(() => {
      const botMsg: IChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'This is a demo, the agent is not up yet.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(e.target.value);
    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.botAvatar}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="16" fill="url(#agent-gradient)"/>
            <path d="M11 14C11 13.45 11.45 13 12 13C12.55 13 13 13.45 13 14C13 14.55 12.55 15 12 15C11.45 15 11 14.55 11 14Z" fill="white"/>
            <path d="M19 14C19 13.45 19.45 13 20 13C20.55 13 21 13.45 21 14C21 14.55 20.55 15 20 15C19.45 15 19 14.55 19 14Z" fill="white"/>
            <path d="M13 19C14 20.33 18 20.33 19 19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 11V9M22 11V9M9 12C8 12 7 13 7 14V18C7 19 8 20 9 20M23 12C24 12 25 13 25 14V18C25 19 24 20 23 20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="agent-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.headerTitle}>Hi! I&apos;m your AI assistant.</h3>
          <p className={styles.headerSub}>How can I help you today?</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                className={styles.suggestionBtn}
                onClick={() => handleSend(s.text)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={styles.suggestionIcon}>{s.icon}</span>
                <span>{s.text}</span>
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`${styles.message} ${msg.isUser ? styles.userMsg : styles.botMsg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!msg.isUser && (
                <div className={styles.msgAvatar}>🤖</div>
              )}
              <div className={styles.msgBubble}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className={`${styles.message} ${styles.botMsg}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.msgAvatar}>🤖</div>
            <div className={styles.typingIndicator}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            className={styles.inputField}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask your SharePoint AI assistant..."
            rows={1}
          />
          <div className={styles.inputActions}>
            <button className={styles.attachBtn} title="Attach file" aria-label="Attach file">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 9.5L8.5 16C7.12 17.38 4.88 17.38 3.5 16C2.12 14.62 2.12 12.38 3.5 11L10 4.5C10.83 3.67 12.17 3.67 13 4.5C13.83 5.33 13.83 6.67 13 7.5L7 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className={`${styles.sendBtn} ${inputValue.trim() ? styles.active : ''}`}
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
