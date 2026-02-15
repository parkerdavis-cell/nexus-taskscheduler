"use client";

import { useState, Suspense } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContacts, type ContactWithWorkspace } from "@/hooks/use-contacts";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";

function ContactsContent() {
  const [search, setSearch] = useState("");
  const [workspace, setWorkspace] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactWithWorkspace | null>(null);

  const { data: workspaces } = useWorkspaces();
  const { data: contacts, isLoading } = useContacts({
    workspace: workspace === "all" ? undefined : workspace,
    search: search || undefined,
  });

  const handleEdit = (contact: ContactWithWorkspace) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingContact(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Contacts</h1>
        </div>
        <Button onClick={() => { setEditingContact(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={workspace} onValueChange={setWorkspace}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All workspaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workspaces</SelectItem>
            {workspaces?.map((ws) => (
              <SelectItem key={ws.slug} value={ws.slug}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: ws.color }}
                  />
                  {ws.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : (
        <ContactList contacts={contacts ?? []} onEdit={handleEdit} />
      )}

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        contact={editingContact}
      />
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense>
      <ContactsContent />
    </Suspense>
  );
}
