import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";

type HeroSlide = { title: string; subtitle: string; image: string };
type HoursRow = { day: string; hours: string };
type ClassRow = { name: string; day: string; time: string; instructor: string };
type PricingTier = { id: string; name: string; price: string; description: string };

type SiteContent = {
  hero: HeroSlide[];
  hours: HoursRow[];
  classes: ClassRow[];
  pricing: PricingTier[];
};

type MemberRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membership: string;
  sex: string;
  ageRange?: string | null;
  role: string;
  createdAt: string;
};

export default function Admin() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/api/content"), apiFetch("/api/admin/users")])
      .then(([contentData, usersData]) => {
        setContent(contentData.content);
        setMembers(usersData.users);
      })
      .catch((err) =>
        toast({
          title: "Couldn't load admin data",
          description: err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveContent(next: SiteContent) {
    setSaving(true);
    try {
      const data = await apiFetch("/api/content", {
        method: "PUT",
        body: JSON.stringify(next),
      });
      setContent(data.content);
      toast({ title: "Saved", description: "Site content updated." });
    } catch (err) {
      toast({
        title: "Couldn't save",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(userId: string, role: string) {
    try {
      const data = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      setMembers((prev) => prev?.map((m) => (m._id === userId ? data.user : m)) ?? null);
      toast({ title: "Updated", description: `${data.user.email} is now ${role}.` });
    } catch (err) {
      toast({
        title: "Couldn't update role",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />
      <div className="pt-32 pb-24 container mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-serif text-secondary mb-8">Admin Panel</h1>

        <Tabs defaultValue="hours">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="hours">Club Hours</TabsTrigger>
            <TabsTrigger value="hero">Homepage Text</TabsTrigger>
            <TabsTrigger value="classes">Class Timetable</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="hours">
            <HoursEditor rows={content.hours} saving={saving} onSave={(hours) => saveContent({ ...content, hours })} />
          </TabsContent>

          <TabsContent value="hero">
            <HeroEditor slides={content.hero} saving={saving} onSave={(hero) => saveContent({ ...content, hero })} />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesEditor
              rows={content.classes}
              saving={saving}
              onSave={(classes) => saveContent({ ...content, classes })}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingEditor
              tiers={content.pricing}
              saving={saving}
              onSave={(pricing) => saveContent({ ...content, pricing })}
            />
          </TabsContent>

          <TabsContent value="members">
            <MembersTable members={members ?? []} onChangeRole={changeRole} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <Button onClick={onSave} disabled={saving} className="mt-4" data-testid="admin-save">
      {saving ? "Saving…" : "Save Changes"}
    </Button>
  );
}

function HoursEditor({
  rows,
  saving,
  onSave,
}: {
  rows: HoursRow[];
  saving: boolean;
  onSave: (rows: HoursRow[]) => void;
}) {
  const [draft, setDraft] = useState(rows);

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6 space-y-3">
        {draft.map((row, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-3">
            <Input
              value={row.day}
              onChange={(e) =>
                setDraft((d) => d.map((r, i) => (i === idx ? { ...r, day: e.target.value } : r)))
              }
            />
            <Input
              value={row.hours}
              onChange={(e) =>
                setDraft((d) => d.map((r, i) => (i === idx ? { ...r, hours: e.target.value } : r)))
              }
            />
          </div>
        ))}
        <SaveBar saving={saving} onSave={() => onSave(draft)} />
      </CardContent>
    </Card>
  );
}

function HeroEditor({
  slides,
  saving,
  onSave,
}: {
  slides: HeroSlide[];
  saving: boolean;
  onSave: (slides: HeroSlide[]) => void;
}) {
  const [draft, setDraft] = useState(slides);

  return (
    <div className="space-y-4">
      {draft.map((slide, idx) => (
        <Card key={idx} className="border-none shadow-lg">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Slide {idx + 1}</p>
            <Textarea
              placeholder="Title (use a line break for a two-line headline)"
              value={slide.title}
              onChange={(e) =>
                setDraft((d) => d.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s)))
              }
            />
            <Input
              placeholder="Subtitle"
              value={slide.subtitle}
              onChange={(e) =>
                setDraft((d) => d.map((s, i) => (i === idx ? { ...s, subtitle: e.target.value } : s)))
              }
            />
            <Input
              placeholder="Image URL"
              value={slide.image}
              onChange={(e) =>
                setDraft((d) => d.map((s, i) => (i === idx ? { ...s, image: e.target.value } : s)))
              }
            />
          </CardContent>
        </Card>
      ))}
      <SaveBar saving={saving} onSave={() => onSave(draft)} />
    </div>
  );
}

function ClassesEditor({
  rows,
  saving,
  onSave,
}: {
  rows: ClassRow[];
  saving: boolean;
  onSave: (rows: ClassRow[]) => void;
}) {
  const [draft, setDraft] = useState(rows);

  function update(idx: number, patch: Partial<ClassRow>) {
    setDraft((d) => d.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6 space-y-3">
        {draft.map((row, idx) => (
          <div key={idx} className="grid sm:grid-cols-5 gap-3 items-center">
            <Input placeholder="Class name" value={row.name} onChange={(e) => update(idx, { name: e.target.value })} />
            <Input placeholder="Day" value={row.day} onChange={(e) => update(idx, { day: e.target.value })} />
            <Input placeholder="Time" value={row.time} onChange={(e) => update(idx, { time: e.target.value })} />
            <Input
              placeholder="Instructor"
              value={row.instructor}
              onChange={(e) => update(idx, { instructor: e.target.value })}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
              data-testid={`remove-class-${idx}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => setDraft((d) => [...d, { name: "", day: "", time: "", instructor: "" }])}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
        <SaveBar saving={saving} onSave={() => onSave(draft)} />
      </CardContent>
    </Card>
  );
}

function PricingEditor({
  tiers,
  saving,
  onSave,
}: {
  tiers: PricingTier[];
  saving: boolean;
  onSave: (tiers: PricingTier[]) => void;
}) {
  const [draft, setDraft] = useState(tiers);

  function update(idx: number, patch: Partial<PricingTier>) {
    setDraft((d) => d.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6 space-y-3">
        {draft.map((tier, idx) => (
          <div key={idx} className="grid sm:grid-cols-4 gap-3 items-center">
            <Input placeholder="Plan name" value={tier.name} onChange={(e) => update(idx, { name: e.target.value })} />
            <Input placeholder="Price" value={tier.price} onChange={(e) => update(idx, { price: e.target.value })} />
            <Input
              placeholder="Description"
              value={tier.description}
              onChange={(e) => update(idx, { description: e.target.value })}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
              data-testid={`remove-pricing-${idx}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <SaveBar saving={saving} onSave={() => onSave(draft)} />
      </CardContent>
    </Card>
  );
}

const ROLE_OPTIONS = ["member", "admin"];

function MembersTable({
  members,
  onChangeRole,
}: {
  members: MemberRow[];
  onChangeRole: (id: string, role: string) => void;
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Age Range</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m._id}>
                <TableCell>
                  {m.firstName} {m.lastName}
                </TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell className="capitalize">{m.membership}</TableCell>
                <TableCell className="capitalize">{m.sex.replace(/_/g, " ")}</TableCell>
                <TableCell>{m.ageRange ? m.ageRange.replace(/_/g, "–") : "—"}</TableCell>
                <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select value={m.role} onValueChange={(role) => onChangeRole(m._id, role)}>
                    <SelectTrigger className="w-28 h-8" data-testid={`role-select-${m._id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No members registered yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
