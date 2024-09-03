import { ParserTransactionTypes } from "@/utils/parser";
import React, { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TypeFilterProps {
  selectedType: ParserTransactionTypes | null;
  onTypeChange: (type: ParserTransactionTypes | null) => void;
}

export function TypeFilter({ selectedType, onTypeChange }: TypeFilterProps) {
  const [availableTypes, setAvailableTypes] = useState<
    ParserTransactionTypes[]
  >([]);

  useEffect(() => {
    // Fetch available types from your API or parse from existing data
    // This is a placeholder, replace with actual logic to get available types
    const fetchAvailableTypes = async () => {
      // const types = await getAvailableTypes();
      const types = Object.values(ParserTransactionTypes);
      setAvailableTypes(types);
    };

    fetchAvailableTypes();
  }, []);

  return (
    <Select
      value={selectedType || ""}
      onValueChange={(value) =>
        onTypeChange(value as ParserTransactionTypes | null)
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Types</SelectItem>
        {availableTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
