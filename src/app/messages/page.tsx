'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Clock, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  subject: string;
  body: string;
  recipient_name: string | null;
  channel: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  properties: {
    id: string;
    title: string;
    suburb: string;
    city: string;
    price: number;
  };
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-100', label: 'Pending' },
  sent: { icon: Send, color: 'text-blue-600 bg-blue-100', label: 'Sent' },
  delivered: { icon: Check, color: 'text-emerald-600 bg-emerald-100', label: 'Delivered' },
  failed: { icon: X, color: 'text-red-600 bg-red-100', label: 'Failed' },
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Your conversations with property owners and agents</p>
        </div>

        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
              <p className="text-slate-600 mb-6">
                Start browsing properties and send inquiries to connect with landlords
              </p>
              <Link href="/listings">
                <Button>
                  Browse Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const status = statusConfig[message.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{message.subject}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{message.body}</p>
                      </div>
                      <Badge className={cn('ml-4', status.color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500">
                        <span>To: {message.recipient_name || 'Property Owner'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      </div>
                      <Link 
                        href={`/listings/${message.properties?.id}`}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        {message.properties?.title || 'View Property'}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

