import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  RefreshCw,
  Users,
  MessageCircle,
  Send,
  Calendar,
  UserCheck
} from 'lucide-react';

interface BulkOperationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkOperation {
  id: string;
  type: string;
  targetCount: number;
  successCount: number;
  failureCount: number;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export default function BulkOperationHistory({ isOpen, onClose }: BulkOperationHistoryProps) {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOperationHistory();
    }
  }, [isOpen]);

  const fetchOperationHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bulk-operations');
      if (response.ok) {
        const result = await response.json();
        setOperations(result.data.map((op: {
          id: string;
          operation_type: string;
          target_count: number;
          success_count: number;
          failure_count: number;
          status: string;
          started_at: string;
          completed_at?: string;
        }) => ({
          ...op,
          createdAt: new Date(op.started_at),
          completedAt: op.completed_at ? new Date(op.completed_at) : undefined
        })));
      }
    } catch (error) {
      console.error('Failed to fetch operation history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'bulk_invite':
        return <Send className="w-5 h-5 text-blue-600" />;
      case 'bulk_message':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'bulk_update_status':
        return <UserCheck className="w-5 h-5 text-orange-600" />;
      case 'bulk_assign_workout':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getOperationTitle = (type: string) => {
    switch (type) {
      case 'bulk_invite':
        return 'Bulk Invite';
      case 'bulk_message':
        return 'Bulk Message';
      case 'bulk_update_status':
        return 'Status Update';
      case 'bulk_assign_workout':
        return 'Workout Assignment';
      default:
        return 'Unknown Operation';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      case 'in_progress':
        return 'text-blue-800 bg-blue-100';
      case 'cancelled':
        return 'text-gray-800 bg-gray-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress...';
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Operations History</h2>
            <p className="text-sm text-gray-600 mt-1">Recent bulk operations and their status</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOperationHistory}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading operation history...</p>
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Operations Yet</h3>
              <p className="text-gray-600">Your bulk operations will appear here once you start using them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => (
                <div key={operation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getOperationIcon(operation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {getOperationTitle(operation.type)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                            {operation.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Targets:</span> {operation.targetCount}
                          </div>
                          <div>
                            <span className="font-medium">Success:</span> {operation.successCount}
                          </div>
                          {operation.failureCount > 0 && (
                            <div>
                              <span className="font-medium">Failed:</span> {operation.failureCount}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Duration:</span> {formatDuration(operation.createdAt, operation.completedAt)}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Started: {operation.createdAt.toLocaleString()}
                          {operation.completedAt && (
                            <span> • Completed: {operation.completedAt.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {getStatusIcon(operation.status)}
                    </div>
                  </div>

                  {/* Progress bar for completed operations */}
                  {operation.status === 'completed' && operation.targetCount > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Success Rate</span>
                        <span>{Math.round((operation.successCount / operation.targetCount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(operation.successCount / operation.targetCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}