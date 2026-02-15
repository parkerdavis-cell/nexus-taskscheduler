"use client";

import { Mail, Phone, Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteContact, type ContactWithWorkspace } from "@/hooks/use-contacts";

interface ContactListProps {
  contacts: ContactWithWorkspace[];
  onEdit: (contact: ContactWithWorkspace) => void;
}

export function ContactList({ contacts, onEdit }: ContactListProps) {
  const deleteContact = useDeleteContact();

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No contacts yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add contacts so the agent can quickly reference people.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-card/80 cursor-pointer"
          onClick={() => onEdit(contact)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {contact.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {contact.workspace && (
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: contact.workspace.color }}
                />
              )}
              <span className="truncate text-sm font-medium">{contact.name}</span>
              {contact.role && (
                <span className="truncate text-xs text-muted-foreground">
                  {contact.role}
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              {contact.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {contact.company}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(contact); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContact.mutate(contact.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
