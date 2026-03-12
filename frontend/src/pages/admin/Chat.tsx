import { useState, useRef, useEffect } from "react";
import { Plus, Users, Hash, UserPlus, X, Shield, Send, ArrowLeft, MessageSquare, LogOut } from "lucide-react";
import { createGroup, getAllGroups, getUsersByRole, addMemberToGroup, getGroupsByMember } from "@/services/group";
import { toast, ToastContainer } from "react-toastify";
import { handleApiError } from "@/utils/handleApiError";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { adminLogout } from "@/features/adminSlice";
import socketService, { type SocketMessage } from "@/services/socket";
import { Logout } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { useRouteProtection } from "@/hooks/useRouteProtection";

// Types
interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Group {
  _id: string;
  name: string;
  memberCount: number;
}

interface Message {
  _id: string;
  sender: string;
  senderInitial: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
}

// Dummy messages per group
const dummyMessages: Record<string, Message[]> = {
  "1": [
    { _id: "m1", sender: "Alice Johnson", senderInitial: "A", text: "Good morning team! 👋", timestamp: "9:00 AM" },
    { _id: "m2", sender: "Bob Smith", senderInitial: "B", text: "Morning! Ready for the standup?", timestamp: "9:02 AM" },
    { _id: "m3", sender: "You", senderInitial: "Y", text: "Yes, joining in 5 mins.", timestamp: "9:03 AM", isSelf: true },
  ],
  "2": [
    { _id: "m4", sender: "Charlie Davis", senderInitial: "C", text: "PR review needed on the auth module.", timestamp: "10:15 AM" },
    { _id: "m5", sender: "Alice Johnson", senderInitial: "A", text: "On it!", timestamp: "10:20 AM" },
  ],
};

export default function AdminDashboard() {
  // Route protection
  const { protectAdminRoute, preventCrossRoleAccess } = useRouteProtection();
  
  // --- State ---
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgMembers, setOrgMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // --- State ---
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeChat, setActiveChat] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(dummyMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const admin = useSelector((state: RootState) => state.admin.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Protect admin route
  useEffect(() => {
    protectAdminRoute();
  }, [protectAdminRoute]);

  // Prevent cross-role access
  useEffect(() => {
    preventCrossRoleAccess(window.location.pathname);
  }, [preventCrossRoleAccess]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await Logout();
      dispatch(adminLogout());
      socketService.disconnect();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if API fails, clear local state
      dispatch(adminLogout());
      socketService.disconnect();
      navigate('/');
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (admin) {
      socketService.connect(admin._id, admin.name);
      
      // Setup socket listeners
      socketService.onNewMessage((message: SocketMessage) => {
        const formattedMessage: Message = {
          _id: message._id,
          sender: message.senderName,
          senderInitial: message.senderName.charAt(0),
          text: message.text,
          timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: message.senderId === admin._id
        };
        
        setMessages(prev => ({
          ...prev,
          [message.groupId]: [...(prev[message.groupId] || []), formattedMessage]
        }));
      });

      socketService.onGroupMessages((groupMessages: SocketMessage[]) => {
        const formattedMessages: Message[] = groupMessages.map(msg => ({
          _id: msg._id,
          sender: msg.senderName,
          senderInitial: msg.senderName.charAt(0),
          text: msg.text,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: msg.senderId === admin._id
        }));
        
        setMessages(prev => ({
          ...prev,
          [groupMessages[0]?.groupId || '']: formattedMessages
        }));
      });

      socketService.onError((error: { message: string }) => {
        toast.error(error.message);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [admin]);

  // Fetch groups created by admin
  useEffect(() => {
    const fetchGroups = async () => {
      if (!admin?._id) return;
      try {
        const groupsData = await getAllGroups(admin._id);
        setGroups(groupsData);
      } catch (error) {
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [admin?._id]);

  // Fetch users with role "user"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsersByRole('user');
        setOrgMembers(usersData);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setMembersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, messages]);

  // --- Actions ---
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !admin?._id) return;
    try {
      const response = await createGroup(newGroupName, admin._id);
      const group = response.group;
      setGroups([...groups, group]);
      setNewGroupName("");
      setIsGroupModalOpen(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      // Use socket for real-time member addition
      socketService.addMemberToGroup(selectedGroup._id, userId);
      
      // Listen for success confirmation
      socketService.onMemberAddedSuccess((data) => {
        if (data.groupId === selectedGroup._id) {
          toast.success('Member added successfully');
          // Update the group member count
          setGroups(groups.map(g => 
            g._id === selectedGroup._id 
              ? { ...g, memberCount: data.memberCount }
              : g
          ));
          // Update selected group as well
          setSelectedGroup({ ...selectedGroup, memberCount: data.memberCount });
        }
      });

      // Listen for errors
      socketService.onError((error) => {
        toast.error(error.message || 'Failed to add member');
      });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    // Send message via socket
    socketService.sendMessage(activeChat._id, newMessage.trim());
    setNewMessage("");
  };

  // Join group when active chat changes
  useEffect(() => {
    if (activeChat) {
      socketService.joinGroup(activeChat._id);
      return () => {
        socketService.leaveGroup(activeChat._id);
      };
    }
  }, [activeChat]);

  const chatMessages = activeChat ? messages[activeChat._id] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {activeChat ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                  <Hash className="w-7 h-7 text-indigo-600" />
                  {activeChat.name}
                </h1>
                <p className="text-slate-500 mt-1">{activeChat.memberCount} members</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-indigo-600" />
                  {admin?.organizationName || "Organization"} Control Panel
                </h1>
              </div>
              <p className="text-slate-500">
                Manage your organization's workspace and communication channels.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!activeChat && (
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="w-5 h-5" />
              Create New Group
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-100"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ─── CHAT VIEW ─── */}
        {activeChat ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Panel */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden" style={{ height: "65vh" }}>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{activeChat.name}</p>
                    <p className="text-xs text-slate-400">{activeChat.memberCount} members</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedGroup(activeChat);
                    setIsMemberModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Members
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <MessageSquare className="w-12 h-12 mb-3" />
                    <p className="text-sm font-semibold">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg._id} className={`flex items-end gap-3 ${msg.isSelf ? "flex-row-reverse" : ""}`}>
                      {!msg.isSelf && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {msg.senderInitial}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${msg.isSelf ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {!msg.isSelf && (
                          <span className="text-xs text-slate-400 font-semibold px-1">{msg.sender}</span>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                            msg.isSelf
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-300 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Message #${activeChat.name}`}
                  className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-11 h-11 bg-indigo-600 disabled:bg-indigo-200 text-white rounded-xl flex items-center justify-center transition-colors hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Sidebar: Members */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 self-start">
              <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> All Members
              </h3>
              <div className="space-y-4">
                {orgMembers.map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ─── DASHBOARD VIEW ─── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Groups List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Active Channels
              </h2>
              {loading ? (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center">
                  <p className="text-slate-500">Loading groups...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center">
                  <p className="text-slate-500">No groups found. Create your first group!</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => setActiveChat(group)}
                    className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 transition-colors">
                        <Hash className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{group.name}</h3>
                        <p className="text-sm text-slate-500">{group.memberCount} members enrolled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                          setIsMemberModalOpen(true);
                        }}
                        className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Members
                      </button>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold group-hover:text-indigo-500 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}

          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Create New Group</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. project-x-sync"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                Create Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Members</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-tighter">
                  To #{selectedGroup?.name}
                </p>
              </div>
              <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {membersLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">Loading users...</p>
                </div>
              ) : orgMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No users found with role "user"</p>
                </div>
              ) : (
                orgMembers.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-500">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(member._id)}
                      className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                    >
                      Add to Group
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsMemberModalOpen(false)} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-bold text-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer autoClose={200} />
    </div>
  );
}