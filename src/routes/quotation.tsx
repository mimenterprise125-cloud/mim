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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  project_type: string;
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
  created_by: string;
  created_at: string;
}

interface QuotationHistory {
  id: string;
  quotation_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_notes: string;
  created_by: string;
  created_at: string;
}

function QuotationPageComponent() {
  const { userProfile, loading } = useAuth();
  const { onRefresh } = useRefresh();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [quotationHistory, setQuotationHistory] = useState<QuotationHistory[]>([]);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const [formData, setFormData] = useState({
    total_sqft: "",
    rate_per_sqft: "",
    gst_percentage: 18,
    profit_percentage: "",
    notes: "",
  });

  const [editData, setEditData] = useState({
    total_sqft: "",
    rate_per_sqft: "",
    gst_percentage: 18,
    profit_percentage: "",
    notes: "",
    change_notes: "",
  });

  useEffect(() => {
    if (!loading && !userProfile) {
      // Use setTimeout to defer navigation to client-side only
      const timer = setTimeout(() => {
        navigate("/login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userProfile, loading, navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchLeadsWithQuotationStatus();
    }
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = onRefresh(() => {
      fetchLeadsWithQuotationStatus();
    });
    return unsubscribe;
  }, [onRefresh]);

  const fetchLeadsWithQuotationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .in("status", ["QUOTATION_SENT", "CONVERTED"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchQuotations = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotations(data || []);

      if (data && data.length > 0) {
        fetchQuotationHistory(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  const fetchQuotationHistory = async (quotationId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotation_history")
        .select("*")
        .eq("quotation_id", quotationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotationHistory(data || []);
    } catch (error) {
      console.error("Error fetching quotation history:", error);
    }
  };

  const calculateQuotation = (sqft: number, ratePerSqft: number, gstPct: number, profitPct: number) => {
    const subtotal = sqft * ratePerSqft;
    const gstAmount = subtotal * (gstPct / 100);
    const totalWithGst = subtotal + gstAmount;
    return { subtotal, gstAmount, totalWithGst };
  };

  const handleCreateQuotation = async () => {
    const sqft = parseFloat(formData.total_sqft);
    const rate = parseFloat(formData.rate_per_sqft);

    if (!selectedLead || !sqft || !rate || sqft <= 0 || rate <= 0) {
      alert("Please fill all required fields with valid values");
      return;
    }

    try {
      const gstPct = parseFloat(formData.gst_percentage.toString()) || 18;
      const profitPct = parseFloat(formData.profit_percentage.toString()) || 0;

      const { subtotal, gstAmount, totalWithGst } = calculateQuotation(
        sqft,
        rate,
        gstPct,
        profitPct
      );

      const { data, error } = await supabase
        .from("quotations")
        .insert({
          lead_id: selectedLead.id,
          total_sqft: sqft,
          rate_per_sqft: rate,
          subtotal,
          gst_percentage: gstPct,
          gst_amount: gstAmount,
          total_with_gst: totalWithGst,
          profit_percentage: profitPct,
          notes: formData.notes,
          created_by: userProfile?.id,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      alert("Quotation created successfully!");
      setFormData({
        total_sqft: "",
        rate_per_sqft: "",
        gst_percentage: 18,
        profit_percentage: "",
        notes: "",
      });
      setShowQuotationForm(false);

      if (selectedLead) {
        fetchQuotations(selectedLead.id);
      }
    } catch (error: any) {
      alert("Error creating quotation: " + error.message);
    }
  };

  const handleUpdateQuotation = async (quotation: Quotation) => {
    const sqft = parseFloat(editData.total_sqft.toString());
    const rate = parseFloat(editData.rate_per_sqft.toString());

    if (!sqft || !rate || sqft <= 0 || rate <= 0) {
      alert("Please fill all required fields with valid values");
      return;
    }

    try {
      const gstPct = parseFloat(editData.gst_percentage.toString()) || 18;
      const profitPct = parseFloat(editData.profit_percentage.toString()) || 0;

      const { subtotal, gstAmount, totalWithGst } = calculateQuotation(
        sqft,
        rate,
        gstPct,
        profitPct
      );

      // Update quotation
      const { error: updateError } = await supabase
        .from("quotations")
        .update({
          total_sqft: sqft,
          rate_per_sqft: rate,
          subtotal,
          gst_percentage: gstPct,
          gst_amount: gstAmount,
          total_with_gst: totalWithGst,
          profit_percentage: profitPct,
          notes: editData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quotation.id);

      if (updateError) throw updateError;

      // Record history for each changed field
      const changes = [];
      if (quotation.total_sqft !== sqft) {
        changes.push({
          field_name: "total_sqft",
          old_value: quotation.total_sqft.toString(),
          new_value: sqft.toString(),
        });
      }
      if (quotation.rate_per_sqft !== rate) {
        changes.push({
          field_name: "rate_per_sqft",
          old_value: quotation.rate_per_sqft.toString(),
          new_value: rate.toString(),
        });
      }
      if (quotation.gst_percentage !== gstPct) {
        changes.push({
          field_name: "gst_percentage",
          old_value: quotation.gst_percentage.toString(),
          new_value: gstPct.toString(),
        });
      }
      if (quotation.profit_percentage !== profitPct) {
        changes.push({
          field_name: "profit_percentage",
          old_value: quotation.profit_percentage.toString(),
          new_value: profitPct.toString(),
        });
      }

      // Insert history records
      if (changes.length > 0) {
        const historyRecords = changes.map((change) => ({
          quotation_id: quotation.id,
          field_name: change.field_name,
          old_value: change.old_value,
          new_value: change.new_value,
          change_notes: editData.change_notes,
          created_by: userProfile?.id,
          created_at: new Date().toISOString(),
        }));

        const { error: historyError } = await supabase
          .from("quotation_history")
          .insert(historyRecords);

        if (historyError) throw historyError;
      }

      alert("Quotation updated successfully!");
      setEditData({
        total_sqft: "",
        rate_per_sqft: "",
        gst_percentage: 18,
        profit_percentage: "",
        notes: "",
        change_notes: "",
      });

      if (selectedLead) {
        fetchQuotations(selectedLead.id);
      }
    } catch (error: any) {
      alert("Error updating quotation: " + error.message);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    fetchQuotations(lead.id);
  };

  if (loading || leadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ink via-ink/95 to-ink/90 flex items-center justify-center">
        <p className="text-gold">Loading...</p>
      </div>
    );
  }

  if (!userProfile) return null;

  const currentQuotation = quotations.length > 0 ? quotations[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink/95 to-ink/90">
      <Sidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b border-gold/10 bg-ink-dark/50 backdrop-blur-sm sticky top-0">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-display text-gold">📄 Quotations</h1>
            <p className="text-sm text-gold/60">Manage quotations and track changes</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leads List */}
            <div className="lg:col-span-1">
              <Card className="bg-ink-card border-gold/20 p-6">
                <h2 className="text-lg font-semibold text-gold mb-4">Leads</h2>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLead?.id === lead.id
                          ? "bg-gold/20 border border-gold/50 text-gold"
                          : "hover:bg-ink/50 border border-gold/10 text-white/80"
                      }`}
                    >
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-gold/60">{lead.phone}</p>
                      <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                        lead.status === "QUOTATION_SENT"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {lead.status}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quotation Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedLead ? (
                <>
                  {/* Current Quotation */}
                  {currentQuotation && (
                    <Card className="bg-ink-card border-gold/20 p-6">
                      <h2 className="text-lg font-semibold text-gold mb-4">Current Quotation</h2>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-gold/60 text-xs uppercase">Total Sq.Ft.</p>
                          <p className="text-2xl font-bold text-white">{currentQuotation.total_sqft}</p>
                        </div>
                        <div>
                          <p className="text-gold/60 text-xs uppercase">Rate/Sq.Ft.</p>
                          <p className="text-2xl font-bold text-white">₹{currentQuotation.rate_per_sqft}</p>
                        </div>
                        <div>
                          <p className="text-gold/60 text-xs uppercase">Subtotal</p>
                          <p className="text-2xl font-bold text-white">₹{currentQuotation.subtotal}</p>
                        </div>
                        <div>
                          <p className="text-gold/60 text-xs uppercase">GST ({currentQuotation.gst_percentage}%)</p>
                          <p className="text-2xl font-bold text-white">₹{currentQuotation.gst_amount}</p>
                        </div>
                        <div className="col-span-2 border-t border-gold/20 pt-4">
                          <p className="text-gold/60 text-xs uppercase">Total with GST</p>
                          <p className="text-3xl font-bold text-gold">₹{currentQuotation.total_with_gst}</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gold/60">Profit %:</p>
                          <p className="text-white">{currentQuotation.profit_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-gold/60">Notes:</p>
                          <p className="text-white/70">{currentQuotation.notes || "—"}</p>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-6 bg-gold text-ink hover:bg-gold/90">
                            Edit Quotation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-gold">Edit Quotation</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-6">
                            {/* Input Fields */}
                            <div className="space-y-4 col-span-2 md:col-span-1">
                              <div>
                                <label className="text-gold text-sm font-medium">Total Sq.Ft. *</label>
                                <Input
                                  type="number"
                                  placeholder="Enter sq.ft."
                                  value={editData.total_sqft}
                                  onChange={(e) =>
                                    setEditData({ ...editData, total_sqft: e.target.value })
                                  }
                                  className="bg-ink border-gold/20 text-white mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-gold text-sm font-medium">Rate Per Sq.Ft. *</label>
                                <Input
                                  type="number"
                                  placeholder="Enter rate"
                                  value={editData.rate_per_sqft}
                                  onChange={(e) =>
                                    setEditData({ ...editData, rate_per_sqft: e.target.value })
                                  }
                                  className="bg-ink border-gold/20 text-white mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-gold text-sm font-medium">GST % *</label>
                                <Input
                                  type="number"
                                  placeholder="18"
                                  value={editData.gst_percentage}
                                  onChange={(e) =>
                                    setEditData({ ...editData, gst_percentage: parseFloat(e.target.value) || 18 })
                                  }
                                  className="bg-ink border-gold/20 text-white mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-gold text-sm font-medium">Profit %</label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={editData.profit_percentage}
                                  onChange={(e) =>
                                    setEditData({ ...editData, profit_percentage: e.target.value })
                                  }
                                  className="bg-ink border-gold/20 text-white mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-gold text-sm font-medium">Change Notes</label>
                                <textarea
                                  value={editData.change_notes}
                                  onChange={(e) => setEditData({ ...editData, change_notes: e.target.value })}
                                  placeholder="Describe the changes..."
                                  className="w-full bg-ink border border-gold/20 text-white rounded p-2 mt-1"
                                  rows={3}
                                />
                              </div>
                            </div>

                            {/* Auto-Calculated Display */}
                            <div className="bg-ink/50 border border-gold/20 rounded-lg p-4 col-span-2 md:col-span-1 space-y-3">
                              <h3 className="text-gold font-semibold text-sm">Calculated Amount</h3>
                              {(() => {
                                const sqft = parseFloat(editData.total_sqft) || 0;
                                const rate = parseFloat(editData.rate_per_sqft) || 0;
                                const gst = editData.gst_percentage || 18;
                                const subtotal = sqft * rate;
                                const gstAmount = subtotal * (gst / 100);
                                const total = subtotal + gstAmount;

                                return (
                                  <>
                                    <div className="space-y-2 border-b border-gold/20 pb-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Subtotal:</span>
                                        <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60">GST ({gst}%):</span>
                                        <span className="text-white font-medium">₹{gstAmount.toFixed(2)}</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                      <span className="text-gold font-semibold">Total with GST:</span>
                                      <span className="text-gold font-bold text-2xl">₹{total.toFixed(2)}</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleUpdateQuotation(currentQuotation)}
                            className="w-full mt-6 bg-gold text-ink hover:bg-gold/90"
                          >
                            Update Quotation
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  )}

                  {/* Create Quotation - Button always visible when no quotation exists */}
                  {!currentQuotation && (
                    <Card className="bg-ink-card border-gold/20 p-6">
                      <Button 
                        onClick={() => setShowQuotationForm(true)}
                        className="w-full bg-gold text-ink hover:bg-gold/90 text-lg py-6"
                      >
                        ➕ Create Quotation
                      </Button>
                    </Card>
                  )}

                  {/* Create Quotation Dialog */}
                  <Dialog open={showQuotationForm} onOpenChange={setShowQuotationForm}>
                    <DialogContent className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-gold text-2xl">Create Quotation</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid grid-cols-2 gap-6">
                        {/* Input Fields */}
                        <div className="space-y-4 col-span-2 md:col-span-1">
                          <div>
                            <label className="text-gold text-sm font-medium">Total Sq.Ft. *</label>
                            <Input
                              type="number"
                              placeholder="Enter sq.ft."
                              value={formData.total_sqft}
                              onChange={(e) =>
                                setFormData({ ...formData, total_sqft: e.target.value })
                              }
                              className="bg-ink border-gold/20 text-white mt-1 text-lg"
                            />
                          </div>
                          <div>
                            <label className="text-gold text-sm font-medium">Rate Per Sq.Ft. (₹) *</label>
                            <Input
                              type="number"
                              placeholder="Enter rate per sq.ft."
                              value={formData.rate_per_sqft}
                              onChange={(e) =>
                                setFormData({ ...formData, rate_per_sqft: e.target.value })
                              }
                              className="bg-ink border-gold/20 text-white mt-1 text-lg"
                            />
                          </div>
                          <div>
                            <label className="text-gold text-sm font-medium">GST % *</label>
                            <Input
                              type="number"
                              placeholder="18"
                              value={formData.gst_percentage}
                              onChange={(e) =>
                                setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) || 18 })
                              }
                              className="bg-ink border-gold/20 text-white mt-1 text-lg"
                            />
                          </div>
                          <div>
                            <label className="text-gold text-sm font-medium">Profit % (Optional)</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={formData.profit_percentage}
                              onChange={(e) =>
                                setFormData({ ...formData, profit_percentage: e.target.value })
                              }
                              className="bg-ink border-gold/20 text-white mt-1 text-lg"
                            />
                          </div>
                          <div>
                            <label className="text-gold text-sm font-medium">Notes (Optional)</label>
                            <textarea
                              placeholder="Add any additional notes..."
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              className="w-full bg-ink border border-gold/20 text-white rounded p-2 mt-1 text-sm"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Auto-Calculated Display */}
                        <div className="bg-gradient-to-br from-gold/10 to-ink/50 border border-gold/30 rounded-lg p-4 col-span-2 md:col-span-1 space-y-4">
                          <h3 className="text-gold font-semibold text-lg border-b border-gold/20 pb-2">
                            📊 Amount Breakdown
                          </h3>
                          
                          {(() => {
                            const sqft = parseFloat(formData.total_sqft) || 0;
                            const rate = parseFloat(formData.rate_per_sqft) || 0;
                            const gst = formData.gst_percentage || 18;
                            const subtotal = sqft * rate;
                            const gstAmount = subtotal * (gst / 100);
                            const total = subtotal + gstAmount;

                            return (
                              <>
                                {/* Input Summary */}
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-white/70">Sq.Ft.:</span>
                                    <span className="text-white font-medium">{sqft.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/70">Rate/Sq.Ft.:</span>
                                    <span className="text-white font-medium">₹{rate.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Calculations */}
                                <div className="space-y-2 border-y border-gold/20 py-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Subtotal:</span>
                                    <span className="text-white font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/70">GST ({gst}%):</span>
                                    <span className="text-white font-semibold">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  </div>
                                </div>

                                {/* Final Total */}
                                <div className="bg-gold/20 border border-gold/30 rounded p-3 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gold font-bold">Total with GST:</span>
                                    <span className="text-gold font-bold text-3xl">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  </div>
                                  {parseFloat(formData.profit_percentage) > 0 && (
                                    <div className="text-xs text-gold/70 pt-2 border-t border-gold/20">
                                      Profit: {formData.profit_percentage}%
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowQuotationForm(false);
                            setFormData({
                              total_sqft: "",
                              rate_per_sqft: "",
                              gst_percentage: 18,
                              profit_percentage: "",
                              notes: "",
                            });
                          }}
                          className="flex-1 border-gold/20 text-gold hover:bg-gold/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateQuotation}
                          className="flex-1 bg-gold text-ink hover:bg-gold/90 text-lg py-6 font-semibold"
                        >
                          ✓ Create Quotation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Change History */}
                  {quotationHistory.length > 0 && (
                    <Card className="bg-ink-card border-gold/20 p-6">
                      <h2 className="text-lg font-semibold text-gold mb-4">Change History</h2>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {quotationHistory.map((record) => (
                          <div
                            key={record.id}
                            className="border-l-2 border-gold/30 pl-4 py-2 text-sm"
                          >
                            <p className="text-gold font-medium">{record.field_name}</p>
                            <p className="text-white/70">
                              {record.old_value} → {record.new_value}
                            </p>
                            {record.change_notes && (
                              <p className="text-gold/60 text-xs mt-1">Note: {record.change_notes}</p>
                            )}
                            <p className="text-gold/40 text-xs mt-1">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="bg-ink-card border-gold/20 p-8 text-center">
                  <p className="text-gold/60">Select a lead to view or create a quotation</p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default QuotationPageComponent;
