'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Clock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EngagementMessage, User } from '@prisma/client';

interface Props {
  engagementId: string;
  currentUser: Pick<User, 'id' | 'name' | 'role'>;
  otherParty: { name: string; role: 'CLIENT' | 'COMPANY_REP' };
  supervisionNotice?: string;
  contactApproved?: boolean;
}

type MessageWithSender = EngagementMessage & {
  sender: Pick<User, 'id' | 'name' | 'role'>;
};

export function SupervisedChat({ 
  engagementId, 
  currentUser, 
  otherParty,
  supervisionNotice,
  contactApproved 
}: Props) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount and poll for updates
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/engagements/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 10 seconds for new messages (replace with SSE/WebSocket in production)
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [engagementId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/engagements/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'TEXT',
          attachments: [],
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Optimistically add message to UI
        if (data.requiresReview) {
          setMessages(prev => [...prev, {
            ...data.message,
            sender: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
          }]);
        } else {
          fetchMessages(); // Refresh to get updated list
        }
        setNewMessage('');
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (message: MessageWithSender) => {
    if (message.status === 'PENDING_REVIEW') {
      return (
        <Badge variant="secondary" className="ml-2 text-amber-700 bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    if (message.isAdminMessage) {
      return (
        <Badge variant="outline" className="ml-2 text-blue-600">
          <Shield className="h-3 w-3 mr-1" />
          SNDBX Admin
        </Badge>
      );
    }
    if (message.isSystemMessage) {
      return (
        <Badge variant="secondary" className="ml-2 text-muted-foreground">
          ℹ️ System
        </Badge>
      );
    }
    return null;
  };

  const isOwnMessage = (message: MessageWithSender) => message.senderId === currentUser.id;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Chat with {otherParty.name}</span>
            {getStatusBadge({ isAdminMessage: true } as MessageWithSender)}
          </CardTitle>
          {!contactApproved && (
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              <Shield className="h-3 w-3 mr-1" />
              Supervised
            </Badge>
          )}
        </div>
        {supervisionNotice && (
          <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            {supervisionNotice}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage(message) ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.role === 'ADMIN' ? '/admin-avatar.png' : undefined} />
                  <AvatarFallback>
                    {message.sender.name?.[0] || message.sender.role[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`max-w-[70%] ${isOwnMessage(message) ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-lg px-3 py-2 ${
                    isOwnMessage(message) 
                      ? 'bg-primary text-primary-foreground' 
                      : message.isAdminMessage 
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {getStatusBadge(message)}
                    {message.status === 'PENDING_REVIEW' && !isOwnMessage(message) && (
                      <span className="text-amber-600">(Not visible to you yet)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={contactApproved ? "Type a message..." : "Type a message (admin will review before delivery)..."}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
            {isSending ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Contact Approval CTA */}
        {!contactApproved && (
          <div className="px-4 pb-4">
            <div className="text-center text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <p>🔒 Direct contact is locked. Messages are reviewed by SNDBX Admin.</p>
              <p className="mt-1">Admin can approve direct contact once engagement milestones are reached.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// === FILE UPLOAD INTEGRATION (append to existing component) ===

// Add this import at the top of the file:
// import { FileAttachmentUploader } from './chat/FileAttachmentUploader';

// Add this state inside the component:
// const [showFileUploader, setShowFileUploader] = useState(false);

// Add this handler:
/*
  const handleFilesUploaded = (urls: string[]) => {
    // Append file URLs to message content or send as separate message
    const fileNote = urls.map(url => `\n📎 Attached: ${url.split('/').pop()}`).join('');
    setNewMessage(prev => prev + fileNote);
    setShowFileUploader(false);
  };
*/

// Add this to the form JSX, before the send button:
/*
  {showFileUploader && (
    <div className="pb-3 border-b mb-3">
      <FileAttachmentUploader
        engagementId={engagementId}
        onUploadComplete={handleFilesUploaded}
        onUploadError={(error) => alert(error)}
        disabled={isSending}
      />
    </div>
  )}
  
  <div className="flex items-center gap-2">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setShowFileUploader(!showFileUploader)}
      disabled={isSending}
      title="Attach files"
    >
      <Paperclip className="h-4 w-4" />
    </Button>
    {/* ... existing input and send button ... */}
  </div>
*/
