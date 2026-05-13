import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRefresh } from "@/lib/refresh-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/site/Sidebar";
import { toast } from "sonner";
import { History } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  project_type: string;
  status: string;
  message: string;
  created_at: string;
}

interface Quotation {
  id: string;
  lead_id: string;
  total_sqft: number;
  rate_per_sqft: number;
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  total_with_gst: number;
  profit_percentage: number;
  notes: string;
  created_at: string;
}

interface QuotationHistory {
  id: string;
  quotation_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_notes: string;
  created_at: string;
}

function LeadsPageComponent() {
  const { userProfile, loading } = useAuth();
  const { triggerRefresh } = useRefresh();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationHistory, setQuotationHistory] = useState<QuotationHistory[]>([]);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [leadHistory, setLeadHistory] = useState<any[]>([]);
  const [showLeadHistory, setShowLeadHistory] = useState(false);
  const [hasLeadChanged, setHasLeadChanged] = useState(false);

  const leadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "SITE_VISIT", "QUOTATION_SENT", "NEGOTIATION", "CONVERTED", "LOST"];

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", location: "", project_type: "", message: "" });
  const [quotationForm, setQuotationForm] = useState({ total_sqft: "", rate_per_sqft: "", gst_percentage: 18, profit_percentage: "", notes: "" });

  useEffect(() => {
    if (!loading && !userProfile) navigate("/login");
  }, [userProfile, loading, navigate]);

  useEffect(() => {
    if (userProfile) fetchLeads();
  }, [userProfile]);

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchQuotationForLead = async (leadId: string) => {
    try {
      const { data, error } = await supabase.from("quotations").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        setSelectedQuotation(data[0]);
        fetchQuotationHistory(data[0].id);
      } else {
        setSelectedQuotation(null);
        setQuotationHistory([]);
      }
    } catch (error) {
      console.error("Error fetching quotation:", error);
    }
  };

  const fetchQuotationHistory = async (quotationId: string) => {
    try {
      const { data, error } = await supabase.from("quotation_history").select("*").eq("quotation_id", quotationId).order("created_at", { ascending: false });
      if (error) throw error;
      setQuotationHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setModalLead(lead);
    setShowModalOpen(true);
    fetchQuotationForLead(lead.id);
    fetchLeadEditHistory(lead.id);
  };

  const handleCreateLead = async () => {
    if (!formData.name || !formData.phone) { toast.error("Name and phone required"); return; }
    try {
      const { error } = await supabase.from("leads").insert({ ...formData, created_by: userProfile?.id, status: "NEW" });
      if (error) throw error;
      setFormData({ name: "", phone: "", email: "", location: "", project_type: "", message: "" });
      setShowAddForm(false);
      fetchLeads();
      toast.success("Lead created successfully!");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleCreateQuotation = async () => {
    console.log("handleCreateQuotation called");
    const sqft = parseFloat(quotationForm.total_sqft);
    const rate = parseFloat(quotationForm.rate_per_sqft);

    console.log("Parsed values:", { sqft, rate, modalLead, selectedQuotation });

    if (!modalLead || !sqft || !rate || sqft <= 0 || rate <= 0) {
      console.log("Validation failed:", { hasModalLead: !!modalLead, sqft, rate });
      toast.error("Fill all required fields");
      return;
    }
    try {
      const gstPct = quotationForm.gst_percentage || 18;
      const profitPct = parseFloat(quotationForm.profit_percentage.toString()) || 0;

      const subtotal = sqft * rate;
      const gstAmount = subtotal * (gstPct / 100);
      const totalWithGst = subtotal + gstAmount;

      // Base data for both create and update
      const baseQuotationData = {
        total_sqft: sqft,
        rate_per_sqft: rate,
        subtotal,
        gst_percentage: gstPct,
        gst_amount: gstAmount,
        total_with_gst: totalWithGst,
        profit_percentage: profitPct,
        notes: quotationForm.notes,
      };

      console.log("Creating/Updating quotation with:", baseQuotationData);

      if (selectedQuotation?.id) {
        // UPDATE existing quotation - only update changeable fields
        const { error, data } = await supabase
          .from("quotations")
          .update({
            ...baseQuotationData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedQuotation.id)
          .select();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Quotation updated successfully:", data);
        
        // Create history entries for each changed field
        const fieldsToTrack = ['total_sqft', 'rate_per_sqft', 'gst_percentage', 'profit_percentage', 'notes'];
        const historyEntries: any[] = [];
        
        fieldsToTrack.forEach(field => {
          const oldValue = String((selectedQuotation as any)[field] || '');
          const newValue = String((baseQuotationData as any)[field] || '');
          
          if (oldValue !== newValue) {
            historyEntries.push({
              quotation_id: selectedQuotation.id,
              field_name: field,
              old_value: oldValue,
              new_value: newValue,
              change_notes: '',
              created_at: new Date().toISOString(),
            });
          }
        });
        
        // Save history entries if there are changes
        if (historyEntries.length > 0) {
          const { error: histError } = await supabase
            .from("quotation_history")
            .insert(historyEntries);
          
          if (histError) {
            console.warn("Could not save history entries:", histError);
          } else {
            console.log("History entries saved:", historyEntries);
          }
        }
        
        toast.success("Quotation updated successfully!");
      } else {
        // CREATE new quotation - include immutable fields
        const { error, data } = await supabase
          .from("quotations")
          .insert({
            ...baseQuotationData,
            lead_id: modalLead.id,
            created_by: userProfile?.id,
          })
          .select();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Quotation created successfully:", data);
        toast.success("Quotation created successfully!");
      }
      
      setQuotationForm({ total_sqft: "", rate_per_sqft: "", gst_percentage: 18, profit_percentage: "", notes: "" });
      setSelectedQuotation(null);
      setShowQuotationForm(false);
      await fetchQuotationForLead(modalLead.id);
    } catch (error: any) {
      console.error("Error in handleCreateQuotation:", error);
      toast.error("Error: " + error.message);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("leads").update({ status: newStatus, updated_at: new Date() }).eq("id", leadId);
      if (error) throw error;
      fetchLeads();
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus });
      setHasLeadChanged(true);
      toast.success("Status updated!");
      
      // Trigger refresh for projects page when lead is converted
      if (newStatus === "CONVERTED") {
        setTimeout(() => triggerRefresh(), 100);
      }
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const fetchLeadEditHistory = async (leadId: string) => {
    try {
      console.log("Fetching history for lead:", leadId);
      
      // Fetch audit logs for the lead
      const { data: auditData, error: auditError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_id", leadId)
        .eq("entity_type", "lead")
        .order("created_at", { ascending: false });
      
      if (auditError) console.warn("Audit logs error:", auditError);
      
      // Also fetch quotation history for this lead's quotations
      const { data: quotations, error: quotError } = await supabase
        .from("quotations")
        .select("id")
        .eq("lead_id", leadId);
      
      if (quotError) console.warn("Quotations error:", quotError);
      
      let quotationHistoryData = [];
      if (quotations && quotations.length > 0) {
        const quotationIds = quotations.map(q => q.id);
        const { data: qHistory, error: qHistError } = await supabase
          .from("quotation_history")
          .select("*")
          .in("quotation_id", quotationIds)
          .order("created_at", { ascending: false });
        
        if (qHistError) console.warn("Quotation history error:", qHistError);
        quotationHistoryData = qHistory || [];
      }
      
      const combinedHistory = [
        ...(auditData || []),
        ...quotationHistoryData.map(qh => ({
          ...qh,
          action: "quotation_change"
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log("Combined history:", combinedHistory);
      setLeadHistory(combinedHistory);
    } catch (error) {
      console.error("Error fetching lead history:", error);
      setLeadHistory([]);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      CONTACTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      FOLLOW_UP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      SITE_VISIT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      QUOTATION_SENT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      NEGOTIATION: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      CONVERTED: "bg-green-500/20 text-green-400 border-green-500/30",
      LOST: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || leadsLoading) return <div className="min-h-screen bg-gradient-to-br from-ink via-ink/95 to-ink/90 flex items-center justify-center"><p className="text-gold">Loading...</p></div>;
  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink/95 to-ink/90">
      <Sidebar />
      <div className="md:ml-64">
        <header className="border-b border-gold/10 bg-ink-dark/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-display text-gold">Leads</h1>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild><Button className="bg-gold text-ink hover:bg-gold/90">+ Add Lead</Button></DialogTrigger>
                <DialogContent className="bg-black border-gold/20">
                  <DialogHeader><DialogTitle className="text-gold">Create New Lead</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-ink border-gold/20 text-white" />
                    <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-ink border-gold/20 text-white" />
                    <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-ink border-gold/20 text-white" />
                    <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="bg-ink border-gold/20 text-white" />
                    <Input placeholder="Project Type" value={formData.project_type} onChange={(e) => setFormData({...formData, project_type: e.target.value})} className="bg-ink border-gold/20 text-white" />
                    <textarea placeholder="Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-ink border border-gold/20 text-white rounded p-2" rows={3} />
                    <Button onClick={handleCreateLead} className="w-full bg-gold text-ink hover:bg-gold/90">Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 min-w-[200px] bg-ink border-gold/20 text-white" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-ink border border-gold/20 text-white rounded text-sm">
                <option value="ALL">All Status</option>
                {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-ink-dark border-gold/20 p-4"><p className="text-gold/60 text-xs">Total</p><p className="text-2xl font-bold text-gold">{leads.length}</p></Card>
            <Card className="bg-ink-dark border-gold/20 p-4"><p className="text-gold/60 text-xs">New</p><p className="text-2xl font-bold text-blue-400">{leads.filter(l => l.status === "NEW").length}</p></Card>
            <Card className="bg-ink-dark border-gold/20 p-4"><p className="text-gold/60 text-xs">Pipeline</p><p className="text-2xl font-bold text-yellow-400">{leads.filter(l => ["CONTACTED", "FOLLOW_UP", "SITE_VISIT", "QUOTATION_SENT"].includes(l.status)).length}</p></Card>
            <Card className="bg-ink-dark border-gold/20 p-4"><p className="text-gold/60 text-xs">Converted</p><p className="text-2xl font-bold text-green-400">{leads.filter(l => l.status === "CONVERTED").length}</p></Card>
          </div>

          {/* Lead Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => (
              <Dialog key={lead.id} open={showModalOpen && modalLead?.id === lead.id} onOpenChange={(open) => !open && setShowModalOpen(false)}>
                <DialogTrigger asChild>
                  <Card className="bg-ink-dark border-gold/20 p-4 cursor-pointer hover:border-gold/50 transition transform hover:scale-105" onClick={() => handleSelectLead(lead)}>
                    <h3 className="font-semibold text-gold mb-2">{lead.name}</h3>
                    <p className="text-white/80 text-sm">{lead.phone}</p>
                    <p className="text-gold/60 text-xs mt-1">{lead.email}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(lead.status)}`}>{lead.status}</span>
                      <span className="text-xs text-gold/40">{lead.location}</span>
                    </div>
                  </Card>
                </DialogTrigger>

                <DialogContent className="bg-black border-gold/20 max-w-2xl">
                  <DialogHeader><DialogTitle className="text-gold">{lead.name}</DialogTitle></DialogHeader>
                  <div className="space-y-6">
                    {/* Lead Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-gold/60 text-xs uppercase">Email</p><p className="text-white">{lead.email}</p></div>
                      <div><p className="text-gold/60 text-xs uppercase">Phone</p><p className="text-white">{lead.phone}</p></div>
                      <div><p className="text-gold/60 text-xs uppercase">Location</p><p className="text-white">{lead.location || "—"}</p></div>
                      <div><p className="text-gold/60 text-xs uppercase">Project Type</p><p className="text-white">{lead.project_type || "—"}</p></div>
                    </div>

                    {lead.message && (<div><p className="text-gold/60 text-xs uppercase">Message</p><p className="text-white/80">{lead.message}</p></div>)}

                    {/* Status Update */}
                    <div><p className="text-gold/60 text-xs uppercase">Status</p><select value={lead.status} onChange={(e) => { updateLeadStatus(lead.id, e.target.value); setModalLead({...lead, status: e.target.value}); }} className="w-full mt-1 px-3 py-2 rounded border border-gold/20 bg-ink text-white"><>{leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}</></select></div>

                    {/* Action Buttons */}
                    <div className="flex gap-2"><Button onClick={() => window.location.href = `mailto:${lead.email}`} className="flex-1 bg-blue-600 hover:bg-blue-700">Email</Button><Button onClick={() => window.location.href = `tel:${lead.phone}`} className="flex-1 bg-green-600 hover:bg-green-700">Call</Button></div>

                    {/* Quotation Section */}
                    {["QUOTATION_SENT", "NEGOTIATION", "CONVERTED"].includes(lead.status) && (
                      <>
                        {selectedQuotation && modalLead?.id === lead.id ? (
                          <div className="border-t border-gold/20 pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-gold font-semibold">Quotation Details</h4>
                              <div className="flex gap-2">
                                <Button onClick={() => { setQuotationForm({ total_sqft: selectedQuotation.total_sqft.toString(), rate_per_sqft: selectedQuotation.rate_per_sqft.toString(), gst_percentage: selectedQuotation.gst_percentage, profit_percentage: selectedQuotation.profit_percentage?.toString() || "", notes: selectedQuotation.notes }); setShowQuotationForm(true); }} className="text-xs bg-orange-600 hover:bg-orange-700 h-8">Edit</Button>
                                <Button 
                                  onClick={() => { setShowLeadHistory(true); }} 
                                  disabled={!leadHistory || leadHistory.length === 0}
                                  className={`text-xs h-8 flex items-center gap-1 ${leadHistory && leadHistory.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600/50 cursor-not-allowed opacity-50'}`}
                                >
                                  <History className="w-3 h-3" /> History
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div><p className="text-gold/60 text-xs">Sq.Ft</p><p className="font-bold text-white">{selectedQuotation.total_sqft}</p></div>
                              <div><p className="text-gold/60 text-xs">Rate/Sq.Ft</p><p className="font-bold text-white">₹{selectedQuotation.rate_per_sqft}</p></div>
                              <div><p className="text-gold/60 text-xs">Subtotal</p><p className="text-white">₹{selectedQuotation.subtotal}</p></div>
                              <div><p className="text-gold/60 text-xs">GST ({selectedQuotation.gst_percentage}%)</p><p className="text-white">₹{selectedQuotation.gst_amount}</p></div>
                              <div className="col-span-2"><p className="text-gold/60 text-xs">TOTAL</p><p className="text-2xl font-bold text-gold">₹{selectedQuotation.total_with_gst}</p></div>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => { setShowQuotationForm(true); setModalLead(lead); }} className="w-full bg-orange-600 hover:bg-orange-700">+ Add Quotation</Button>
                        )}
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {/* Quotation Form Dialog - OUTSIDE the map loop */}
          {showQuotationForm && modalLead && (
            <Dialog open={showQuotationForm} onOpenChange={setShowQuotationForm}>
              <DialogContent 
                onClick={(e) => e.stopPropagation()}
                className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]"
              >
                <DialogHeader>
                  <DialogTitle className="text-gold text-xl">{selectedQuotation?.id ? "Edit Quotation" : "Create Quotation"} for {modalLead.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6">
                  {/* Input Fields */}
                  <div className="space-y-4 col-span-2 md:col-span-1">
                    <div>
                      <label className="text-gold text-sm font-medium">Total Sq.Ft. *</label>
                      <Input
                        type="number"
                        placeholder="Enter sq.ft."
                        value={quotationForm.total_sqft}
                        onChange={(e) => setQuotationForm({...quotationForm, total_sqft: e.target.value})}
                        className="bg-ink border-gold/20 text-white mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gold text-sm font-medium">Rate Per Sq.Ft. (₹) *</label>
                      <Input
                        type="number"
                        placeholder="Enter rate"
                        value={quotationForm.rate_per_sqft}
                        onChange={(e) => setQuotationForm({...quotationForm, rate_per_sqft: e.target.value})}
                        className="bg-ink border-gold/20 text-white mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gold text-sm font-medium">GST % *</label>
                      <Input
                        type="number"
                        placeholder="18"
                        value={quotationForm.gst_percentage}
                        onChange={(e) => setQuotationForm({...quotationForm, gst_percentage: parseFloat(e.target.value) || 18})}
                        className="bg-ink border-gold/20 text-white mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gold text-sm font-medium">Profit % (Optional)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={quotationForm.profit_percentage}
                        onChange={(e) => setQuotationForm({...quotationForm, profit_percentage: e.target.value})}
                        className="bg-ink border-gold/20 text-white mt-1 text-sm"
                      />
                    </div>
                  </div>

                  {/* Notes Section - Optional */}
                  <div className="col-span-2 border-t border-gold/10 pt-4">
                    <label className="text-gold/60 text-xs font-medium">NOTES (OPTIONAL)</label>
                    <textarea
                      placeholder="Add any additional notes about this quotation..."
                      value={quotationForm.notes}
                      onChange={(e) => setQuotationForm({...quotationForm, notes: e.target.value})}
                      className="w-full bg-ink border border-gold/10 text-white/70 rounded p-2 mt-2 text-sm focus:border-gold/30 focus:text-white transition"
                      rows={2}
                    />
                  </div>

                  {/* Auto-Calculated Display */}
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 col-span-2 md:col-span-1 space-y-3">
                    <h3 className="text-gold font-semibold text-sm">📊 Amount Breakdown</h3>
                    {(() => {
                      const sqft = parseFloat(quotationForm.total_sqft) || 0;
                      const rate = parseFloat(quotationForm.rate_per_sqft) || 0;
                      const gst = quotationForm.gst_percentage || 18;
                      const subtotal = sqft * rate;
                      const gstAmount = subtotal * (gst / 100);
                      const total = subtotal + gstAmount;

                      return (
                        <>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">Sq.Ft.:</span>
                              <span className="text-white font-medium">{sqft.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Rate/Sq.Ft.:</span>
                              <span className="text-white font-medium">₹{rate.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1 border-y border-gold/20 py-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">Subtotal:</span>
                              <span className="text-white font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">GST ({gst}%):</span>
                              <span className="text-white font-semibold">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="bg-gold/20 border border-gold/30 rounded p-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gold text-xs font-bold">Total:</span>
                              <span className="text-gold font-bold text-lg">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowQuotationForm(false);
                      setQuotationForm({ total_sqft: "", rate_per_sqft: "", gst_percentage: 18, profit_percentage: "", notes: "" });
                    }}
                    className="flex-1 border-gold/20 text-gold hover:bg-gold/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Create/Update Quotation clicked", { modalLead, form: quotationForm, isEditing: !!selectedQuotation?.id });
                      handleCreateQuotation();
                    }}
                    className="flex-1 bg-gold text-ink hover:bg-gold/90"
                  >
                    ✓ {selectedQuotation?.id ? "Update Quotation" : "Create Quotation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Lead History Dialog - Separate Modal */}
          <Dialog open={showLeadHistory} onOpenChange={setShowLeadHistory}>
            <DialogContent className="bg-black border-gold/20 max-w-md max-h-[80vh] overflow-y-auto z-[10000]">
              <DialogHeader>
                <DialogTitle className="text-gold text-lg">Quotation Changes</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {leadHistory && leadHistory.length > 0 ? (
                  leadHistory.map((entry: any) => (
                    <div key={entry.id} className="bg-ink/50 border border-gold/30 rounded p-3">
                      {/* Show only for quotation changes */}
                      {entry.action === "quotation_change" ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-gold text-xs font-semibold capitalize">{entry.field_name}</p>
                            <p className="text-gold/40 text-xs whitespace-nowrap">{new Date(entry.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="text-red-400 line-through max-w-20 truncate">{String(entry.old_value)}</span>
                            <span className="text-gold/40">→</span>
                            <span className="text-green-400 font-semibold max-w-20 truncate">{String(entry.new_value)}</span>
                          </div>
                        </div>
                      ) : (
                        /* Audit Log Display */
                        entry.old_values && entry.new_values && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-gold text-xs font-semibold capitalize">{Object.keys(entry.new_values)[0]}</p>
                              <p className="text-gold/40 text-xs whitespace-nowrap">{new Date(entry.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs">
                              <span className="text-red-400 line-through max-w-20 truncate">{String(Object.values(entry.old_values)[0])}</span>
                              <span className="text-gold/40">→</span>
                              <span className="text-green-400 font-semibold max-w-20 truncate">{String(Object.values(entry.new_values)[0])}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gold/60 text-sm py-4">No changes yet</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default LeadsPageComponent;
