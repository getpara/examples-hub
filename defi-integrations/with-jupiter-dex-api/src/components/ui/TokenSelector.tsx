"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Check, ChevronDown, Search } from "lucide-react";
import { Token } from "@/types";

interface TokenSelectorProps {
  selectedToken: Token;
  tokens: Token[];
  onSelect: (token: Token) => void;
}

export default function TokenSelector({ selectedToken, tokens, onSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 min-w-[140px] justify-between px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none">
        <div className="flex items-center gap-2">
          <Image
            src={selectedToken.icon || "/placeholder.svg"}
            alt={selectedToken.name}
            width={24}
            height={24}
          />
          <span>{selectedToken.symbol}</span>
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute z-10 mt-1 w-[200px] bg-white border border-gray-200 shadow-lg">
          <div className="flex items-center border-b border-gray-200 p-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search token..."
              className="w-full focus:outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">No token found.</div>
            ) : (
              <ul>
                {filteredTokens.map((token) => (
                  <li
                    key={token.id}
                    onClick={() => {
                      onSelect(token);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Image
                        src={token.icon || "/placeholder.svg"}
                        alt={token.name}
                        width={24}
                        height={24}
                      />
                      <span className="text-sm">{token.symbol}</span>
                    </div>
                    {selectedToken.id === token.id && <Check className="h-4 w-4 text-blue-500" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
