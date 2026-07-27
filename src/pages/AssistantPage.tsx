import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Bot, User as UserIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Explain photosynthesis simply',
  'Summarize the French Revolution',
  'Solve: 2x + 5 = 15',
  'Write a Python function to reverse a string',
  'Translate "Hello, how are you?" to Khmer',
];

export default function AssistantPage() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');
    setLoading(true);

    // Simulated assistant response (demo — no external AI provider configured)
    await new Promise((r) => setTimeout(r, 800));
    const lower = content.toLowerCase();
    let reply = '';
    if (lower.includes('solve') || /[0-9].*=.*[0-9]/.test(content)) {
      reply = `Let me solve that step by step:\n\n1. Start with: ${content.replace(/solve:?/i, '').trim()}\n2. Isolate the variable\n3. Simplify both sides\n4. Result: [solution]\n\n[Connect a math API for real solutions.]`;
    } else if (lower.includes('translate')) {
      reply = `Translation:\n\n[Connect a translation API to translate: "${content}"]`;
    } else if (lower.includes('python') || lower.includes('code') || lower.includes('function')) {
      reply = `Here's an approach:\n\n\`\`\`python\n# Example implementation\n${content.includes('reverse') ? 'def reverse(s): return s[::-1]' : 'def solve(): pass'}\n\`\`\`\n\n[Connect a code AI for real generation.]`;
    } else if (lower.includes('summar')) {
      reply = `Summary:\n\n[Connect an AI provider to summarize: "${content}"]`;
    } else {
      reply = `Here's what I think about "${content}":\n\n[Connect an AI chat API to enable real conversational responses. The assistant is designed to answer questions, explain lessons, summarize documents, translate, generate code, and solve math.]`;
    }
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  return (
    <div className="pt-16 min-h-screen flex flex-col">
      <div className="section py-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">AI Chat Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask anything — homework, explanations, code, math, translation
            </p>
          </div>
        </div>

        <div className="card flex-1 flex flex-col overflow-hidden" style={{ minHeight: '60vh' }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400 mb-4">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">How can I help you today?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  I can answer questions, explain lessons, summarize documents, translate languages, generate code, and solve math problems.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 hover:text-brand-700 dark:hover:text-brand-300 transition text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`grid place-items-center w-8 h-8 rounded-lg shrink-0 ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400'
                  }`}
                >
                  {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'glass'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="glass rounded-2xl px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 mb-2"
              >
                <Trash2 className="w-3 h-3" /> Clear conversation
              </button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={session ? 'Type your message...' : 'Sign in to save your conversations'}
                className="input flex-1"
              />
              <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
