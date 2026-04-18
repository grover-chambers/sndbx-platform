'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Search, Filter, Download, RefreshCw, Eye, MessageSquare, 
  Shield, User, Clock, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditEvent {
  id: string;
  engagementId: string;
  eventType: string;
  actor: { id: string; name: string | null; email: string | null; role: string };
  metadata: any;
  notes: string | null;
  createdAt: string;
}

interface Props {
  engagementId: string;
  className?: string;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  MESSAGE_SENT: { icon: MessageSquare, label: 'Message Sent', color: 'blue' },
  MESSAGE_APPROVED: { icon: CheckCircle, label: 'Message Approved', color: 'green' },
  MESSAGE_REJECTED: { icon: AlertTriangle, label: 'Message Rejected', color: 'red' },
  KEYWORD_FLAGGED: { icon: Shield, label: 'Keyword Flagged', color: 'amber' },
  CONTACT_APPROVED: { icon: CheckCircle, label: 'Contact Approved', color: 'green' },
  SUPERVISION_CHANGED: { icon: Shield, label: 'Supervision Updated', color: 'purple' },
  BYPASS_ATTEMPT: { icon: AlertTriangle, label: 'Bypass Attempt', color: 'red' },
};

export function SupervisionAuditLog({ engagementId, className = '' }: Props) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    search: '',
    dateRange: '7d',
  });
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = async (newCursor?: string, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(filters.eventType && { eventType: filters.eventType }),
        ...(filters.search && { search: filters.search }),
        ...(newCursor && { cursor: newCursor }),
      });
      
      if (filters.dateRange === '24h') {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        params.append('dateFrom', yesterday);
      } else if (filters.dateRange === '7d') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        params.append('dateFrom', weekAgo);
      }
      
      const res = await fetch(`/api/admin/engagements/${engagementId}/supervision/audit?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setEvents(prev => append ? [...prev, ...data.events] : data.events);
        setCursor(data.pagination.nextCursor);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [engagementId, filters.eventType]);

  const handleRefresh = () => {
    setCursor(undefined);
    setHasMore(true);
    fetchEvents();
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Event', 'Actor', 'Notes', 'Metadata'].join(','),
      ...events.map(e => [
        new Date(e.createdAt).toISOString(),
        e.eventType,
        e.actor.name || e.actor.email,
        `"${e.notes?.replace(/"/g, '""') || ''}"`,
        `"${JSON.stringify(e.metadata).replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${engagementId}.csv`;
    a.click();
  };

  const getEventIcon = (eventType: string) => {
    const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.MESSAGE_SENT;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 text-${config.color}-600`} />;
  };

  const getEventBadge = (eventType: string) => {
    const config = EVENT_TYPE_CONFIG[eventType] || {};
    return (
      <Badge variant="outline" className={`text-${config.color}-700 border-${config.color}-300`}>
        {config.label || eventType}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Supervision Audit Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes or events..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-9"
              />
            </div>
          </div>
          
          <Select 
            value={filters.eventType} 
            onValueChange={(value) => {
              setFilters(f => ({ ...f, eventType: value }));
              setCursor(undefined);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All event types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.dateRange}
            onValueChange={(value) => setFilters(f => ({ ...f, dateRange: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading audit events...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No supervision events found for this engagement
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">
                      <div className="flex flex-col">
                        <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                        <span className="text-muted-foreground">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.eventType)}
                        {getEventBadge(event.eventType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {event.actor.name || event.actor.email}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {event.actor.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate" title={event.notes || ''}>
                        {event.notes || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Load More */}
          {hasMore && !loading && (
            <div className="p-4 text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchEvents(cursor, true)}
              >
                Load More
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
