"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { HandleType } from "@/hooks/use-csv-parser";

interface HandleEntryFormProps {
  onAddHandle: (handle: string, type: HandleType) => void;
}

export function HandleEntryForm({ onAddHandle }: HandleEntryFormProps) {
  const [handle, setHandle] = useState("");
  const [type, setType] = useState<HandleType>("TWITTER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onAddHandle(handle, type);
      setHandle("");
      setType("TWITTER");
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-sm font-medium">Or Add Handles Manually</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="@username"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="flex-1"
        />
        <Select
          value={type}
          onValueChange={(value) => setType(value as HandleType)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TWITTER">Twitter</SelectItem>
            <SelectItem value="TELEGRAM">Telegram</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          variant="secondary">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}