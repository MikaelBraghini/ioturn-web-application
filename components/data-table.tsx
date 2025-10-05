"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"

interface Column<T> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  description?: string
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  searchPlaceholder?: string
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  title,
  description,
  columns,
  data,
  onEdit,
  onDelete,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum registro encontrado",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder={searchPlaceholder}
                className="pl-9 w-[300px] bg-input border-border"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-semibold text-foreground">
                    {column.label}
                  </TableHead>
                ))}
                {(onEdit || onDelete) && (
                  <TableHead className="font-semibold text-foreground text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(row)}
                              className="gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(row)}
                              className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
