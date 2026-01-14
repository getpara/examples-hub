"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HandleType = "TWITTER" | "TELEGRAM";

type WalletResult = {
  handle: string;
  type: HandleType;
  walletAddress: string;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
};

interface ResultsTableProps {
  results: WalletResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination values
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = results.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = Number.parseInt(value);
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  // Function to truncate addresses for display
  const truncate = (str: string) => {
    if (!str) return "";
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // Function to render status badge
  const renderStatusBadge = (status: WalletResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Handle</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{result.handle}</TableCell>
                <TableCell className="capitalize">{result.type}</TableCell>
                <TableCell className="font-mono">
                  {result.walletAddress ? truncate(result.walletAddress) : "-"}
                </TableCell>
                <TableCell>{renderStatusBadge(result.status)}</TableCell>
                <TableCell>
                  {result.status === "failed" && <span className="text-xs text-red-500">{result.errorMessage}</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{endIndex} of {totalItems} results
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
