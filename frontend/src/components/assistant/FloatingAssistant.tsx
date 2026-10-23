import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getAssistantResponse, ChatMessage } from '../../services/aiService';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

export const FloatingAssistant: React.FC = () => {
  const { 
    schemes, 
    beneficiaries, 
    inspections, 
    installments, 
    riskCases, 
    selectedDistrict, 
    language,
    setActivePage
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: language === 'hi' 
        ? 'नमस्ते! मैं **ग्रामसेतु सहायक** हूँ। मैं ग्रामीण विकास योजनाओं, लंबित सत्यापन, स्थलीय निरीक्षण और धोखाधड़ी की रोकथाम में आपकी सहायता कर सकता हूँ।'
        : 'Hello! I am **GramSetu Sahayak**, your AI co-pilot for rural development scheme monitoring and beneficiary accountability.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const isHi = language === 'hi';

  const quickPrompts = isHi
    ? [
        'मेरे ब्लॉक में कितने आवेदन लंबित हैं?',
        'उच्च जोखिम वाले मामलों की सूची दिखाएं',
        'कौन-सी किश्तें अनुमोदन हेतु प्रतीक्षारत हैं?',
        'आज के निरीक्षणों का सारांश दें',
      ]
    : [
        'How many applications are pending in my area?',
        'Show high-risk cases awaiting review',
        'Which scheme installments need approval?',
        'Summarize field inspection status',
      ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await getAssistantResponse(textToSend, {
        schemes,
        beneficiaries,
        inspections,
        installments,
        riskCases,
        selectedDistrict,
        language,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedAction: response.relatedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#0D3B2E] hover:bg-[#174C3C] text-white rounded-full shadow-2xl border-2 border-[#E99A36] transition-all transform hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#E99A36] animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0D3B2E]" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isHi ? 'ग्रामसेतु सहायक' : 'GramSetu Sahayak'}
          </span>
          <span className="text-[10px] bg-[#E99A36] text-[#0D3B2E] px-1.5 py-0.5 rounded font-extrabold uppercase">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`
            bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden transition-all duration-200
            ${isExpanded 
              ? 'w-[90vw] max-w-2xl h-[80vh]' 
              : 'w-[92vw] sm:w-96 h-[540px] max-h-[85vh]'}
          `}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#0D3B2E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#E99A36] text-[#0D3B2E] rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs tracking-wide">
                    {isHi ? 'ग्रामसेतु सहायक AI' : 'GramSetu Sahayak AI'}
                  </h3>
                  <span className="text-[9px] bg-emerald-500 text-white px-1.5 rounded-full font-semibold">
                    Live Context
                  </span>
                </div>
                <p className="text-[10px] text-[#789B82]">
                  {isHi ? 'योजना व सत्यापन प्रशासनिक मार्गदर्शक' : 'Bilingual Rural Scheme Co-pilot'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#C4D1C9] hover:text-white rounded-lg hover:bg-white/10"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#C4D1C9] hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7F6F0]/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#174C3C] text-[#E99A36] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`
                    max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed
                    ${msg.sender === 'user' 
                      ? 'bg-[#174C3C] text-white rounded-tr-xs shadow-xs' 
                      : 'bg-white text-[#192D3A] rounded-tl-xs border border-gray-200 shadow-2xs'}
                  `}
                >
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </div>

                  {msg.relatedAction && (
                    <button
                      onClick={() => {
                        setActivePage(msg.relatedAction!.targetPage);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0D3B2E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>{msg.relatedAction.label}</span>
                      <ArrowRight className="w-3 h-3 text-[#23865B]" />
                    </button>
                  )}

                  <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-[#789B82]' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <Bot className="w-4 h-4 animate-bounce text-[#174C3C]" />
                <span className="italic">{isHi ? 'सहायक विश्लेषण कर रहा है...' : 'Analyzing platform records...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] bg-gray-50 hover:bg-[#F7F6F0] text-[#174C3C] border border-[#C4D1C9] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isHi ? 'प्रश्न या निर्देश पूछें...' : 'Ask question in Hindi or English...'}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#192D3A] outline-hidden focus:border-[#174C3C] focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className="p-2 bg-[#174C3C] hover:bg-[#0D3B2E] disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
