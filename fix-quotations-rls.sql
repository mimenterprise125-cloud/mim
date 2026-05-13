-- ============================================================================
-- FIX: ENABLE RLS AND ADD POLICIES FOR QUOTATIONS TABLE
-- ============================================================================

-- Enable RLS on quotations table
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quotation_history table
ALTER TABLE public.quotation_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Quotations Table
-- ============================================================================

-- Allow sales/accounts to view quotations for leads they can access
CREATE POLICY "Users can view quotations for their leads"
ON public.quotations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = quotations.lead_id
    AND (
      l.assigned_to = auth.uid() 
      OR l.created_by = auth.uid()
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  )
);

-- Allow sales/accounts to create quotations
CREATE POLICY "Sales can create quotations"
ON public.quotations FOR INSERT
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'sales', 'accounts')
  AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = quotations.lead_id
    AND (
      l.assigned_to = auth.uid() 
      OR l.created_by = auth.uid()
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  )
);

-- Allow users to update quotations
CREATE POLICY "Users can update quotations"
ON public.quotations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = quotations.lead_id
    AND (
      l.assigned_to = auth.uid() 
      OR l.created_by = auth.uid()
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  )
);

-- Allow users to delete quotations
CREATE POLICY "Users can delete quotations"
ON public.quotations FOR DELETE
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  OR created_by = auth.uid()
);

-- ============================================================================
-- RLS POLICIES - Quotation History Table
-- ============================================================================

-- Allow users to view quotation history
CREATE POLICY "Users can view quotation history"
ON public.quotation_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotations q
    INNER JOIN public.leads l ON l.id = q.lead_id
    WHERE q.id = quotation_history.quotation_id
    AND (
      l.assigned_to = auth.uid() 
      OR l.created_by = auth.uid()
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  )
);

-- Allow users to create history records
CREATE POLICY "Users can create quotation history"
ON public.quotation_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotations q
    INNER JOIN public.leads l ON l.id = q.lead_id
    WHERE q.id = quotation_history.quotation_id
    AND (
      l.assigned_to = auth.uid() 
      OR l.created_by = auth.uid()
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  )
);
