import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Package,
  LogOut,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/App";
import api from "@/lib/api";
import { STATUS_CONFIG, FLAG_CONFIG, getStatusLabel, getStatusColor, getFlagLabel, getFlagColor, SCORING_CONFIG } from "@/utils/scoring";

const FILTER_OPTIONS = [
  { value: "all", label: "All Submissions" },
  { value: "approved", label: "Approved" },
  { value: "deposit_required", label: "Deposit Required" },
  { value: "not_qualified", label: "Not Qualified" },
  { value: "flagged", label: "High Risk" }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, submissionsData] = await Promise.all([
        api.getDashboardStats(),
        filter === "flagged"
          ? api.getSubmissions(null, true)
          : filter === "all"
          ? api.getSubmissions()
          : api.getSubmissions(filter)
      ]);
      setStats(statsData);
      setSubmissions(submissionsData);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsDetailOpen(true);
  };

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    
    try {
      await api.deleteSubmission(id);
      toast.success("Submission deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete submission");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold text-zinc-900 block" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Smart Stores
              </span>
              <span className="text-xs text-zinc-500">Admin Dashboard</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total"
            value={stats?.total || 0}
            color="bg-zinc-100 text-zinc-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={stats?.approved || 0}
            color="bg-green-50 text-green-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={Clock}
            label="Deposit"
            value={stats?.deposit_required || 0}
            color="bg-yellow-50 text-yellow-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={XCircle}
            label="Not Qualified"
            value={stats?.not_qualified || 0}
            color="bg-red-50 text-red-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={AlertTriangle}
            label="High Risk"
            value={stats?.high_risk || 0}
            color="bg-orange-50 text-orange-600"
            isLoading={isLoading}
          />
        </div>

        {/* Filters & Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={filter === option.value ? "bg-zinc-900 hover:bg-zinc-800" : ""}
                data-testid={`filter-${option.value}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="gap-2"
            data-testid="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Table */}
        <Card className="shadow-lg shadow-zinc-200/50 border-zinc-100 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Users className="w-12 h-12 mb-4 text-zinc-300" />
                <p className="text-lg font-medium">No submissions yet</p>
                <p className="text-sm">Submissions will appear here once customers complete the form</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Shoe Model</TableHead>
                      <TableHead className="font-semibold text-center">Score</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Flags</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow 
                        key={submission.id} 
                        className="hover:bg-zinc-50 cursor-pointer"
                        onClick={() => handleViewSubmission(submission)}
                        data-testid={`submission-row-${submission.id}`}
                      >
                        <TableCell className="font-medium">{submission.full_name}</TableCell>
                        <TableCell className="text-zinc-600">{submission.active_phone}</TableCell>
                        <TableCell className="text-zinc-600">{submission.shoe_model}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                            submission.score >= 70
                              ? "bg-green-100 text-green-700"
                              : submission.score >= 45
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {submission.score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(submission.status)} border`}>
                            {STATUS_CONFIG[submission.status]?.shortLabel || submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {submission.flags.length === 0 ? (
                              <span className="text-zinc-400 text-sm">None</span>
                            ) : (
                              submission.flags.slice(0, 2).map((flag) => (
                                <Badge key={flag} variant="outline" className={`${getFlagColor(flag)} text-xs`}>
                                  {FLAG_CONFIG[flag]?.shortLabel || flag}
                                </Badge>
                              ))
                            )}
                            {submission.flags.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{submission.flags.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-sm">
                          {formatDate(submission.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSubmission(submission)}
                              data-testid={`view-submission-${submission.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              data-testid={`delete-submission-${submission.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isLoading }) {
  return (
    <Card className="shadow-sm border-zinc-100 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
            {isLoading ? (
              <div className="h-7 w-8 bg-zinc-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-zinc-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionDetailModal({ submission, isOpen, onClose }) {
  if (!submission) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const FIELD_LABELS = {
    buying_for: "Buying for",
    shopping_frequency: "Shopping frequency",
    bought_shoes_online: "Bought shoes online before",
    buying_behavior: "Buying behavior",
    payment_readiness: "Payment readiness",
    delivery_availability: "Delivery availability",
    commitment_preference: "Commitment preference",
    confirmation: "Confirmation"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <span>Submission Details</span>
            <Badge className={`${getStatusColor(submission.status)} border ml-4`}>
              {getStatusLabel(submission.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Score Summary */}
          <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-xl">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold ${
              submission.score >= 70
                ? "bg-green-100 text-green-700"
                : submission.score >= 45
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}>
              {submission.score}
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900">{submission.full_name}</p>
              <p className="text-sm text-zinc-500">{formatDate(submission.created_at)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {submission.flags.map((flag) => (
                  <Badge key={flag} className={`${getFlagColor(flag)} border text-xs`}>
                    {getFlagLabel(flag)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailRow label="Active Phone" value={submission.active_phone} />
              <DetailRow label="Alternative Phone" value={submission.alternative_phone || "Not provided"} />
              <DetailRow label="Address" value={submission.address} className="sm:col-span-2" />
              <DetailRow label="Landmark" value={submission.landmark} className="sm:col-span-2" />
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Order Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <DetailRow label="Shoe Model" value={submission.shoe_model} />
              <DetailRow label="Size" value={submission.shoe_size} />
              <DetailRow label="Color" value={submission.shoe_color} />
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Score Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(submission.breakdown || {}).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{FIELD_LABELS[key] || key}</p>
                    <p className="text-xs text-zinc-500">{data.answer}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    data.points > 0
                      ? "bg-green-100 text-green-700"
                      : data.points < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {data.points > 0 ? "+" : ""}{data.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-zinc-900">{value}</p>
    </div>
  );
}
