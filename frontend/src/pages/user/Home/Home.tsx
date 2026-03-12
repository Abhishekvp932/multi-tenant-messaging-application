import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Hash, Send, Users, ShieldCheck, User, MessageSquare, LogOut } from "lucide-react";
import type { RootState } from "@/app/store";
import { getGroupsByMember } from "@/services/group";
import socketService, { type SocketMessage } from "@/services/socket";
import { toast } from "react-toastify";
import { logout } from "@/features/userSlice";
import { Logout } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { useRouteProtection } from "@/hooks/useRouteProtection";

// Types
interface Group {
  _id: string;
  name: string;
}

interface Message {
  _id: string;
  text: string;
  senderName: string;
  createdAt: string;
  groupId: string;
}

export default function ChatPage() {
  // Route protection
  const { protectUserRoute, preventCrossRoleAccess } = useRouteProtection();
  
  // Use data from Redux (or dummy user)
  const user = useSelector((state:RootState) => state.user.user)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- State ---
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Protect user route
  useEffect(() => {
    protectUserRoute();
  }, [protectUserRoute]);

  // Prevent cross-role access
  useEffect(() => {
    preventCrossRoleAccess(window.location.pathname);
  }, [preventCrossRoleAccess]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await Logout();
      dispatch(logout());
      socketService.disconnect();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      dispatch(logout());
      socketService.disconnect();
      navigate('/');
    }
  };

  // Fetch groups where user is a member
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?._id) return;
      try {
        const groupsData = await getGroupsByMember(user._id);
        setGroups(groupsData);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?._id]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      socketService.connect(user._id, user.name);
      
      // Setup socket listeners
      socketService.onNewMessage((message: SocketMessage) => {
        if (activeGroup && message.groupId === activeGroup._id) {
          setMessages(prev => [...prev, {
            _id: message._id,
            text: message.text,
            senderName: message.senderName,
            createdAt: message.createdAt,
            groupId: message.groupId
          }]);
        }
      });

      socketService.onGroupMessages((groupMessages: SocketMessage[]) => {
        if (activeGroup && groupMessages.length > 0) {
          setMessages(groupMessages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            senderName: msg.senderName,
            createdAt: msg.createdAt,
            groupId: msg.groupId
          })));
        }
      });

      // Listen for real-time group additions
      socketService.onAddedToGroup((data) => {
        toast.success(`You've been added to group: ${data.groupName}`);
        // Refetch groups to get the updated list
        const fetchGroups = async () => {
          if (!user?._id) return;
          try {
            const groupsData = await getGroupsByMember(user._id);
            setGroups(groupsData);
          } catch (error) {
            console.error('Failed to fetch groups:', error);
          }
        };
        fetchGroups();
      });

      socketService.onError((error: { message: string }) => {
        toast.error(error.message);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, activeGroup]);

  // Auto-scroll logic
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeGroup]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup) return;

    // Send message via socket
    socketService.sendMessage(activeGroup._id, newMessage.trim());
    setNewMessage("");
  };

  // Join group when active group changes
  useEffect(() => {
    if (activeGroup) {
      socketService.joinGroup(activeGroup._id);
      return () => {
        socketService.leaveGroup(activeGroup._id);
      };
    }
  }, [activeGroup]);

  return (
    <div className="flex h-screen w-full bg-white text-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shadow-sm">
        
        {/* Organization Header */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
            <h1 className="text-sm font-bold uppercase tracking-widest truncate">
              {user?.organizationName || "Organization"}
            </h1>
          </div>
        </div>
        
        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-tighter">Groups</span>
            <Users className="w-4 h-4" />
          </div>
          
          <nav className="px-2 space-y-0.5">
            {loading ? (
              <div className="px-3 py-4 text-center">
                <p className="text-slate-400 text-sm">Loading groups...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-slate-400 text-sm">No groups found</p>
              </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setActiveGroup(group)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeGroup?._id === group._id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Hash className={`w-4 h-4 ${activeGroup?._id === group._id ? "text-indigo-200" : "text-slate-400"}`} />
                  <span className="truncate">{group.name}</span>
                </button>
              ))
            )}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-slate-200 bg-slate-100/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{user?.name || 'User'}</p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] text-indigo-600 font-black uppercase">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white">
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-slate-200 flex items-center px-8 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Hash className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {activeGroup.name}
                </h3>
              </div>
            </header>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              {messages
                .filter(m => m.groupId === activeGroup._id)
                .map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`flex items-start gap-4 ${msg.senderName === user?.name ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className={`flex flex-col ${msg.senderName === user?.name ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm max-w-lg ${
                        msg.senderName === user?.name 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <footer className="p-6 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  placeholder={`Send a message to #${activeGroup.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-12 px-6 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-slate-400"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-slate-200 flex items-center justify-center mb-6 border border-slate-100">
              <MessageSquare className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Select a Workspace</h3>
            <p className="text-slate-500 mt-2 max-w-xs text-center leading-relaxed">
              Choose a channel from the sidebar to view the conversation history and start messaging.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}