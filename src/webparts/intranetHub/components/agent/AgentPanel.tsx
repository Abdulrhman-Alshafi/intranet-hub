import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AgentPanel.module.scss';

const IconBot: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v2a2 2 0 0 1-2 2h-1v1a1 1 0 0 1-2 0v-1H8v1a1 1 0 0 1-2 0v-1H5a2 2 0 0 1-2-2v-2a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

interface IChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SUGGESTIONS = [
  { text: "What's happening this week?" },
  { text: 'Find company policies' },
  { text: 'How do I request PTO?' },
];

const AgentPanel: React.FC = () => {
  const [messages, setMessages] = React.useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatAreaRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (): void => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      {/* Chat Area */}
      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <motion.div
              className={styles.welcomeInner}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.botAvatar}>
                <IconBot size={32} />
              </div>
              <div className={styles.headerText}>
                <h3 className={styles.headerTitle}>Hi! I&apos;m your AI assistant.</h3>
                <p className={styles.headerSub}>How can I help you today?</p>
              </div>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    className={styles.suggestionBtn}
                    onClick={() => handleSend(s.text)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{s.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
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
                <div className={styles.msgAvatar}><IconBot size={16} /></div>
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
            <div className={styles.msgAvatar}><IconBot size={16} /></div>
            <div className={styles.typingIndicator}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </motion.div>
        )}

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
