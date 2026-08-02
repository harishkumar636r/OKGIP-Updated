import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, CheckCheck, Clock, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Messaging: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');

  const fetchData = async () => {
    try {
      const [msgRes, userRes] = await Promise.all([
        api.get('/messages'),
        api.get('/users'),
      ]);
      if (msgRes.data.success) setMessages(msgRes.data.data);
      if (userRes.data.success) {
        // Filter out self from user list
        setUsersList(userRes.data.data.filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Failed to load messages or users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !content.trim()) return;

    try {
      const res = await api.post('/messages', {
        receiverId: selectedUser.id,
        subject,
        content: content.trim(),
      });
      if (res.data.success) {
        setContent('');
        setSubject('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchUserQuery.toLowerCase();
    const email = u.email.toLowerCase();
    const empName = u.employee ? `${u.employee.first_name} ${u.employee.last_name}`.toLowerCase() : '';
    return email.includes(q) || empName.includes(q) || u.role.toLowerCase().includes(q);
  });

  const conversationMessages = selectedUser
    ? messages.filter((m) => (m.sender_id === selectedUser.id || m.receiver_id === selectedUser.id))
    : messages;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-teal-500/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-3">
          <MessageSquare className="w-3.5 h-3.5" /> Direct In-App Messaging & Upskilling Advice
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          In-App Communication Hub
        </h1>
        <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
          Communicate directly with department heads, managers, or colleagues regarding knowledge gap goals, training progress, or task feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* User / Recipient List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 space-y-3">
            <h3 className="font-bold text-xs text-slate-900">Select Recipient</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Search managers or employees..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {filteredUsers.map((u) => {
              const name = u.employee ? `${u.employee.first_name} ${u.employee.last_name}` : u.email;
              const isSelected = selectedUser?.id === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{u.role} ({u.email})</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread Panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          {/* Conversation Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            {selectedUser ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-200">
                  {selectedUser.employee ? selectedUser.employee.first_name[0] : selectedUser.email[0]}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">
                    {selectedUser.employee ? `${selectedUser.employee.first_name} ${selectedUser.employee.last_name}` : selectedUser.email}
                  </h3>
                  <p className="text-[10px] text-teal-700 font-bold">{selectedUser.role} Account</p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-500">All Enterprise Activity Messages</p>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40 custom-scrollbar">
            {conversationMessages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">
                No message history yet. Select a recipient and send a message below!
              </div>
            ) : (
              conversationMessages.map((m) => {
                const isMine = m.sender_id === user?.id;

                return (
                  <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-600">{m.sender_name}</span>
                      <span className="text-[9px] text-slate-400">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`p-4 rounded-2xl max-w-lg ${isMine ? 'bg-teal-700 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs'}`}>
                      {m.subject && <p className={`font-bold text-xs mb-1 ${isMine ? 'text-teal-100' : 'text-slate-900'}`}>{m.subject}</p>}
                      <p className="text-xs leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composition Box */}
          {selectedUser ? (
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 space-y-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line (optional)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
              />
              <div className="flex items-center gap-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write message content..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium h-12"
                />
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 font-medium border-t border-slate-200">
              Select a recipient from the left column to begin writing a message
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
