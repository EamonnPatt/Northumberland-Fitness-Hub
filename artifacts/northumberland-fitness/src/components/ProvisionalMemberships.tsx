import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";

type Plan = "daily" | "weekly" | "monthly";
type Status = "upcoming" | "active" | "expired";

type ProvisionalMembership = {
  _id: string;
  key: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  plan: Plan;
  price: string;
  startDate: string;
  endDate: string;
  notes: string;
  employee: string;
  createdBy: string;
  createdAt: string;
  confirmation: "" | "sent" | "failed" | "skipped";
  status: Status;
};

type Notification = { status: "sent" | "failed" | "skipped"; message: string };

type PricingTier = { id: string; price: string };

const PLANS: { value: Plan; label: string; pricingId: string }[] = [
  { value: "daily", label: "Daily Pass", pricingId: "daily-pass" },
  { value: "weekly", label: "Weekly Pass", pricingId: "weekly-pass" },
  { value: "monthly", label: "Monthly Pass", pricingId: "monthly-pass" },
];

const STATUS_STYLE: Record<Status, string> = {
  active: "bg-green-600 text-white hover:bg-green-600",
  upcoming: "bg-blue-600 text-white hover:bg-blue-600",
  expired: "bg-muted-foreground text-white hover:bg-muted-foreground",
};

// The gym's calendar day, so the form defaults to the right date late in the evening too.
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

// When the pass was entered, in the gym's time zone whatever the viewer's computer is set to.
function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProvisionalMemberships({ pricing }: { pricing: PricingTier[] }) {
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<ProvisionalMembership[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [created, setCreated] = useState<ProvisionalMembership | null>(null);
  const [notice, setNotice] = useState<Notification | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "all") params.set("status", status);
    try {
      const data = await apiFetch(`/api/admin/provisional?${params}`);
      setMemberships(data.memberships);
    } catch (err) {
      toast({
        title: "Couldn't load memberships",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  // Search as the employee types (short delay so it isn't one request per keystroke).
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function resend(m: ProvisionalMembership) {
    try {
      const data = await apiFetch(`/api/admin/provisional/${m._id}/resend`, { method: "POST" });
      setMemberships((prev) => prev?.map((x) => (x._id === m._id ? data.membership : x)) ?? null);
      toast({
        title: data.notification.status === "sent" ? "Sent" : "Not sent",
        description: data.notification.message,
        variant: data.notification.status === "sent" ? "default" : "destructive",
      });
    } catch (err) {
      toast({
        title: "Couldn't resend",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  async function remove(m: ProvisionalMembership) {
    if (!window.confirm(`Delete ${m.firstName} ${m.lastName}'s ${m.plan} pass (key ${m.key})? This can't be undone.`)) return;
    try {
      await apiFetch(`/api/admin/provisional/${m._id}`, { method: "DELETE" });
      setMemberships((prev) => prev?.filter((x) => x._id !== m._id) ?? null);
      if (created?._id === m._id) {
        setCreated(null);
        setNotice(null);
      }
      toast({ title: "Deleted", description: "Membership removed." });
    } catch (err) {
      toast({
        title: "Couldn't delete",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <AddForm
        pricing={pricing}
        onCreated={(m, notification) => {
          setCreated(m);
          setNotice(notification);
          load();
        }}
      />

      {created && (
        <Card className="border-none shadow-lg bg-primary text-primary-foreground" data-testid="provisional-created">
          <CardContent className="p-6 text-center">
            <p className="text-sm uppercase tracking-wider">
              {created.firstName} {created.lastName} · {PLANS.find((p) => p.value === created.plan)?.label} ·{" "}
              {formatDate(created.startDate)} – {formatDate(created.endDate)}
            </p>
            <p className="text-5xl font-bold tracking-[0.3em] mt-2" data-testid="provisional-created-key">
              {created.key}
            </p>
            <p className="text-sm mt-1" data-testid="provisional-created-notice">
              {notice?.status === "sent" ? notice.message : "Give the customer this key."}
            </p>
            {notice && notice.status !== "sent" && (
              <p className="text-sm mt-2 inline-block bg-white text-destructive font-semibold px-3 py-1 rounded">
                {notice.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="grid sm:grid-cols-[1fr_12rem] gap-3">
            <Input
              placeholder="Look up by 4-digit key, name, phone or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              data-testid="provisional-search"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="provisional-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All passes</SelectItem>
                <SelectItem value="active">Active now</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {memberships === null ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Pass</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Handled by</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.map((m) => (
                    <TableRow key={m._id} data-testid={`provisional-row-${m.key}`}>
                      <TableCell className="font-mono text-lg font-bold">{m.key}</TableCell>
                      <TableCell>
                        {m.firstName} {m.lastName}
                      </TableCell>
                      <TableCell className="capitalize">{m.plan}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {m.startDate === m.endDate
                          ? formatDate(m.startDate)
                          : `${formatDate(m.startDate)} – ${formatDate(m.endDate)}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLE[m.status]}>{m.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {m.phone || "—"}
                        {m.email && <div className="text-xs text-muted-foreground">{m.email}</div>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {m.confirmation === "sent" && <span className="text-green-700 font-medium">Emailed</span>}
                        {m.confirmation === "failed" && <span className="text-destructive font-medium">Failed</span>}
                        {m.confirmation === "skipped" && <span className="text-muted-foreground">Not sent</span>}
                        {m.confirmation === "" && "—"}
                        {m.email && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 ml-2"
                            onClick={() => resend(m)}
                            data-testid={`provisional-resend-${m.key}`}
                          >
                            {m.confirmation === "sent" ? "Resend" : "Send"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{m.price ? `$${m.price}` : "—"}</TableCell>
                      <TableCell>{m.employee || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap" data-testid={`provisional-added-${m.key}`}>
                        {formatTimestamp(m.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-48 whitespace-normal">{m.notes || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => remove(m)}
                          aria-label={`Delete ${m.firstName} ${m.lastName}`}
                          data-testid={`provisional-delete-${m.key}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {memberships.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {query || status !== "all" ? "No passes match." : "No provisional memberships yet."}
                </p>
              )}
              {memberships.length === 200 && (
                <p className="text-center text-sm text-muted-foreground">Showing the 200 newest — search to narrow down.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const emptyForm = { firstName: "", lastName: "", phone: "", email: "", employee: "", notes: "" };

function AddForm({ pricing, onCreated }: { pricing: PricingTier[]; onCreated: (m: ProvisionalMembership, notification: Notification) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [plan, setPlan] = useState<Plan>("daily");
  const [startDate, setStartDate] = useState(today);
  const [price, setPrice] = useState("");
  // Until the employee types a price, follow the price set on the Pricing tab.
  const [priceEdited, setPriceEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  const listedPrice = pricing.find((t) => t.id === PLANS.find((p) => p.value === plan)?.pricingId)?.price ?? "";
  const shownPrice = priceEdited ? price : listedPrice.replace(/^\$/, "");

  function set(field: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim() && !form.email.trim()) {
      toast({
        title: "Contact needed",
        description: "Enter a phone number or an email address.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const data = await apiFetch("/api/admin/provisional", {
        method: "POST",
        body: JSON.stringify({ ...form, plan, startDate, price: shownPrice }),
      });
      onCreated(data.membership, data.notification);
      setForm(emptyForm);
      setStartDate(today());
      setPriceEdited(false);
      toast({
        title: "Added",
        description: `Key ${data.membership.key} for ${data.membership.firstName}. ${data.notification.message}`,
      });
    } catch (err) {
      toast({
        title: "Couldn't add membership",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={submit} className="space-y-3">
          <h2 className="text-xl font-serif text-secondary uppercase">New Provisional Membership</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
              data-testid="provisional-first-name"
            />
            <Input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              required
              data-testid="provisional-last-name"
            />
            <Input placeholder="Phone (phone or email required)" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <Input
              placeholder="Email (gets the sign-in code)"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
              <SelectTrigger data-testid="provisional-plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required aria-label="Start date" />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">$</span>
              <Input
                className="pl-7"
                placeholder="Amount paid, e.g. 40.00"
                inputMode="decimal"
                value={shownPrice}
                onChange={(e) => {
                  setPrice(e.target.value.replace(/^\$/, ""));
                  setPriceEdited(true);
                }}
                aria-label="Amount paid in dollars before HST"
                data-testid="provisional-price"
              />
            </div>
          </div>
          <Input
            placeholder="Employee who handled the transaction"
            value={form.employee}
            onChange={(e) => set("employee", e.target.value)}
            required
            maxLength={100}
            data-testid="provisional-employee"
          />
          <Textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          <Button type="submit" disabled={saving} data-testid="provisional-add">
            {saving ? "Adding…" : "Add Membership"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
