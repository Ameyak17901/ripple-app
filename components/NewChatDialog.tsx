"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { useCreateNewChat } from "@/hooks/use-create-new-chat";
import { useState } from "react";
import { useChatContext } from "stream-chat-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserSearch from "./UserSearch";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export const NewChatDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Doc<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const createNewChat = useCreateNewChat();
  const { setActiveChannel } = useChatContext();

  const { user } = useUser();

  const handleSelectUser = (user: Doc<"users">) => {
    if (!selectedUsers.find((_user) => _user._id === user._id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((_user) => _user._id !== userId));
  };

  const handleNewChat = async () => {
    const totalMembers = selectedUsers.length + 1;
    const isGroupChat = totalMembers > 2;

    const channel = await createNewChat({
      members: [
        user?.id as string,
        ...selectedUsers.map((user) => user.userId),
      ],
      createdBy: user?.id as string,
      groupName: isGroupChat ? groupName.trim() || undefined : undefined,
    });

    setActiveChannel(channel);
    setSelectedUsers([]);
    setGroupName("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setSelectedUsers([]);
      setGroupName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start new Chat</DialogTitle>
          <DialogDescription>
            Search for users to start a new chat with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <UserSearch onSelectUser={handleSelectUser} className="w-full" />
          {/* Selected Users */}
          {selectedUsers.length > 0 &&
            selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-2 bg-muted/50 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Image
                    src={user.imageUrl}
                    alt={user.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeUser(user._id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          {selectedUsers.length > 1 && (
            <div className="space-y-2">
              <label
                htmlFor="groupName"
                className="text-sm font-medium text-muted-foreground"
              >
                Group Name (Optional)
              </label>
              <Input
                id="groupName"
                type="text"
                placeholder="Enter the name for your group chat..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default name: &quot; Group Chat (
                {selectedUsers.length + 1}) members &quot;
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={selectedUsers.length === 0} onClick={handleNewChat}>
            {selectedUsers.length === 1
              ? `Create Group Chat (${selectedUsers.length + 1} members)`
              : selectedUsers.length === 1
                ? "Start Chat"
                : "Create Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
