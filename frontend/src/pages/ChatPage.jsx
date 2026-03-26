import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";
import Sidebar from "../components/layout/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import GroupChatContainer from "../components/group/GroupChatContainer";
import WelcomeScreen from "../components/chat/WelcomeScreen";
import ProfileModal from "../components/profile/ProfileModal";
import CreateGroupModal from "../components/group/CreateGroupModal";

export default function ChatPage() {
  const { authUser } = useAuthStore();
  const { socket } = useSocketStore();
  const {
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    fetchUsers,
    fetchUnreadCounts,
  } = useChatStore();
  const {
    selectedGroup,
    fetchGroups,
    fetchGroupUnreadCounts,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();
    fetchUnreadCounts();
    fetchGroups();
    fetchGroupUnreadCounts();
  }, []);

  // Subscribe to socket events only when socket is ready
  useEffect(() => {
    if (!socket) return;
    subscribeToMessages(authUser._id);
    subscribeToGroupMessages();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupMessages();
    };
  }, [socket]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar
        onOpenProfile={() => setShowProfile(true)}
        onCreateGroup={() => setShowCreateGroup(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedUser && !selectedGroup ? (
          <ChatContainer />
        ) : selectedGroup && !selectedUser ? (
          <GroupChatContainer />
        ) : (
          <WelcomeScreen />
        )}
      </main>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </div>
  );
}
