"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table"

import Link from "next/link"
import { QueryKey, UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query"
import { MRT_ColumnDef } from "material-react-table"
import { CSSProperties, ReactNode, memo, useEffect, useId, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { format } from "date-fns"
import $ from "jquery"
import SearchColumnCell from "./components/SearchColumnCell.Client"
import Skeleton from "react-loading-skeleton"
import { clamp, random } from "lodash"
import truncate from "truncate"
import FlyoutMenu from "./components/FlyoutMenu.Client"
import { cn } from "@/lib/utils"
import ButtonIcon from "../ButtonIcon"
import SelectSingle from "../SelectSingle"
import Icon from "../Icon"

const tableURLWithParams = (basePath: string, apiPath: string, token: string) => {
  console.log(basePath + apiPath)
  return {
    apiUrl: `${basePath}${apiPath}`,
    headerOptions: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: String(token),
      },
    },
  }
}

export type TSortProps = {
  columnIndex: number | null
  order: "asc" | "desc" | null
}

interface URLProps {
  basePath: string
  apiPath: string
  token?: string
}

export interface TablePagyLiteProps<TDataRecord extends Record<string, any>> {
  url: URLProps
  columnHeaders: (Pick<MRT_ColumnDef<TDataRecord>, "accessorKey" | "header"> & {
    containerClassName?: string
    className?: string
    filterable?: boolean
    sortable?: boolean
  } & (
      | {
          Cell?: (e: TDataRecord) => ReactNode
          dateFormat?: undefined
        }
      | {
          Cell?: undefined
          dateFormat?: string
        }
    ))[]
  addPaginationIndexToUrl?: boolean
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  sizeName?: string
  startName?: string
  totalRowName?: string
  sortBy?: { label: "sortBy" | (string & {}); value: keyof TDataRecord }
  sortOrder?: { label: "sortOrder" | (string & {}); value: "asc" | "desc" }
  enablePagination?: boolean
  /**
   * @description
   * This is the key (supports deep key dot notation) that will be used to access the
   * data from the response.
   * @example
   * If the response is like this:
   * ```json
   * {
   *   "status": 200,
   *   "results": {
   *     "content": [...],
   *     "pageable": {...},
   *     "last": true,
   *     "totalPages": 1,
   *     "totalElements": 4,
   *     "size": 50,
   *     "number": 0,
   *     "first": true,
   *     "empty": false
   *   },
   *   "totalRows": null
   * }
   * ```
   * The dataAccessorKey will be `results.content`
   */
  dataAccessorKey?: string
  /**
   * @description
   * The options to pass to the useQuery hook
   * @example
   * ```tsx
   * <TablePagy
   * // other props
   *  queryParameters={{
   *   staleTime: 1000 * 60 * 5, // 5 minutes
   *   refetchOnWindowFocus: false,
   * }}
   * />
   * ```
   */
  queryParameters?: Omit<UndefinedInitialDataOptions<unknown, Error, any, QueryKey>, "queryFn">
  emptyCellValue?: "mDash" | "N/A" | null | (string & {})
  onRowClick?: (e: TDataRecord) => void
  onRowClickHref?: (e: TDataRecord) => string
}

export function TablePagyLite<TDataRecord extends Record<string, any>>({
  url,
  columnHeaders,
  addPaginationIndexToUrl = false,
  rowsPerPage = 10,
  rowsPerPageOptions,
  sizeName = "size",
  startName = "start",
  totalRowName = "total_row",
  sortBy,
  sortOrder,
  enablePagination = true,
  dataAccessorKey = "results",
  queryParameters,
  emptyCellValue = null,
  onRowClick,
  onRowClickHref,
}: TablePagyLiteProps<TDataRecord>) {
  const tCellCommonClassList = "ml-2 mr-1"
  const tHeadClassList = cn(
    tCellCommonClassList,
    "flex justify-between items-center h-3 text-left align-middle my-2 text-slate-500 h-max me-2 select-none space-x-2"
  )
  const tCellClassList = cn(
    tCellCommonClassList,
    "inline-block text-left align-middle py-2 text-base text-slate-800"
  )
  const defaultColumnSize: CSSProperties = { minWidth: 180, maxWidth: 1000, width: "auto" }
  const rowsPerPageGeneratedOptions = (arr: NonNullable<typeof rowsPerPageOptions>) =>
    arr.map((value) => {
      return {
        label: `${value}`,
        value: `${value}`,
      }
    })
  // * generate array upto 5 options from rowsPerPage in the multiple of factor
  const defaultRowsPerPageGeneratedOptions = Array.from({ length: 5 }, (_, i) => {
    const factor = [1, 2, 5, 10, 50]
    const value = rowsPerPage * factor[i]
    return {
      label: `${value}`,
      value: `${value}`,
    }
  })
  // + state management
  const [rowCount, setRowCount] = useState(0)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: rowsPerPage,
  })
  const [filterColumn, setFilterColumn] = useState<number | null>(null)
  // * memoized column headers to prevent re-evaluation on every render
  const memoizedColumnHeaders = useMemo(() => columnHeaders, [columnHeaders])
  // + table pagy data fetcher function
  const fetchData = async () => {
    // if (!url) {
    //   // => pagination of raw data (TBD)
    //   // return rawData

    //   console.log("rawData", rawData)
    //   setRowCount(rawData.length)

    //   return enablePagination && rawData.length > 0
    //     ? rawData.slice(
    //         pagination.pageIndex * pagination.rowsPerPage,
    //         (pagination.pageIndex + 1) * pagination.rowsPerPage
    //       )
    //     : rawData
    // }

    const apiUrl = new URL(
      url.basePath + url.apiPath + `${addPaginationIndexToUrl ? `/${pagination.pageIndex + 1}` : ""}`
    )
    apiUrl.searchParams.set(
      startName,
      `${startName == "start" ? pagination.pageIndex * pagination.pageSize : pagination.pageIndex}`
    )
    apiUrl.searchParams.set(sizeName, `${pagination.pageSize}`)
    sortBy && apiUrl.searchParams.set(sortBy.label, sortBy.value.toString())
    sortOrder && apiUrl.searchParams.set(sortOrder.label, sortOrder.value)

    try {
      console.log(url)

      const options: RequestInit = {
        ...tableURLWithParams(url.basePath, url.apiPath, url?.token ?? "").headerOptions,
        method: "GET",
        next: { revalidate: 0 },
      }

      const response = await fetch(apiUrl.href, options)

      if (process.env.NODE_ENV === "production" && response.status !== 200) {
        // * redirect to error page based on response status in production
        console.error(
          "TablePagy response status >>> ",
          response.status,
          " TablePagy response >>> ",
          response.text()
        )

        // router.push(redirectLinks?.[response.status] ?? `/error?code=${response.status}`)
      } else if (process.env.NODE_ENV === "development" && response.status !== 200) {
        // * just log in development
        console.error(
          "TablePagy response status >>> ",
          response.status,
          " TablePagy response >>> ",
          response.text()
        )
      }

      const json = await response.json()
      console.log("Fetched data of TablePagy >>> ", json)

      const isExpectedDataDefined =
        dataAccessorKey?.split(".").reduce((acc, key) => acc?.[key], json) !== undefined

      if (isExpectedDataDefined) {
        // * if response is successful and the response returns data, then return the data
        setRowCount(json[totalRowName])

        // accessing nested object using dot notation
        return dataAccessorKey.split(".").reduce((acc, key) => {
          return acc[key]
        }, json) as TDataRecord[]
      } else {
        // * if response is successful but the response returns no data, then return empty array
        setRowCount(0)
        return []
      }
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const qk = [useId().replace(/:/g, "").toLocaleLowerCase()] /** unique quey key if no query keys provided */
  // * defaults query parameters for useQuery hook
  const mergedQueryParameters = {
    // enabled: url != undefined || rawData.length > 0,
    // enabled: true,
    retry: 3,
    refetchInterval: 1000 * 60 * 5, // 5 mins
    ...queryParameters, // above queryKey will be overwritten by this parameter, below ones will be appended
    queryKey: [
      ...(queryParameters?.queryKey.length ? queryParameters.queryKey : qk),
      pagination.pageIndex,
      pagination.pageSize,
      // sorting
    ],
    queryFn: fetchData,
    // placeholderData: (previousData: TDataRecord[]) => previousData ?? [],
    // ...(rawData.length ? { initialData: rawData } : {}),
  }

  // + useQuery hook for fetching data
  const {
    data: responseDynamicData,
    isError,
    isLoading,
    isRefetching,
    isFetching,
    isPending,
    status,
    fetchStatus,
  } = useQuery<any, Error, TDataRecord[], QueryKey>({
    ...mergedQueryParameters,
  })
  // + generate cell data to render
  const GenerateCells = memo(({ tCell }: { tCell: TDataRecord }) => {
    return (
      <>
        {columnHeaders.map((col, index) => {
          const { accessorKey, dateFormat, Cell } = col

          const accessorKeyValue = /**
           * reduce the accessorKey to get the value from the object
           */
          typeof accessorKey == "string" && accessorKey?.split(".").reduce((acc, key) => acc?.[key], tCell)
          const extractedRenderValue =
            typeof accessorKeyValue === "object"
              ? null /** render null if object found, react cannot render object as jsx */
              : dateFormat
                ? accessorKeyValue && format(new Date(accessorKeyValue), dateFormat)
                : accessorKeyValue

          return (
            <TableCell key={index}>
              <span
                className={cn(
                  `tpl-cell-${index}`,
                  typeof extractedRenderValue === "number" && "text-right",
                  tCellClassList,
                  col.header.startsWith("Action") && "block"
                )}
                style={col.header.startsWith("Action") ? undefined : defaultColumnSize}
              >
                {Cell ? (
                  Cell?.(tCell)
                ) : accessorKeyValue ? (
                  extractedRenderValue
                ) : emptyCellValue === "mDash" ? (
                  <>&mdash;</>
                ) : (
                  emptyCellValue
                )}
              </span>
              {index === 0 && onRowClickHref && (
                <Link href={onRowClickHref(tCell)} className="absolute inset-0" />
              )}
            </TableCell>
          )
        })}
      </>
    )
  })
  // +
  const NoRecordsFound = memo(({ className = "hidden" }: { className?: string }) => (
    <TableRow className={cn(className)} id="empty-records-on-filter">
      <TableCell colSpan={memoizedColumnHeaders.length}>
        <span className={cn(tCellClassList, "block py-28 text-center italic text-black/[0.6]")}>
          No records to display
        </span>
      </TableCell>
    </TableRow>
  ))
  // * generate random width for skeleton
  const generateRandomSkeletonWidth = (len: number) =>
    clamp(random(len, 150), 5) < 40 ? random(80, 150) : clamp(random(len, 150), 5, 150)
  // * sort table column state management
  const [sortProps, setSortProps] = useState<TSortProps>({
    columnIndex: null,
    order: null,
  })
  // * sort table column function
  const sortColumn = (columnIndex: (typeof sortProps)["columnIndex"], order: (typeof sortProps)["order"]) =>
    setSortProps({
      columnIndex,
      order,
    })

  // * sort table column
  useEffect(() => {
    function sortTableColumn() {
      const tableRows = $("tr:has(.tpl-cell-0)").get()

      if (sortProps.order === null) {
        // If order is null, restore original order
        tableRows.sort((a, b) => {
          return $(a).data("row-index") - $(b).data("row-index")
        })
      } else {
        tableRows.sort((a, b) => {
          const aValue = $(a).find(`.tpl-cell-${sortProps.columnIndex}`).text().trim()
          const bValue = $(b).find(`.tpl-cell-${sortProps.columnIndex}`).text().trim()

          if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
            return sortProps.order === "asc"
              ? Number(aValue) - Number(bValue)
              : Number(bValue) - Number(aValue)
          } else {
            return sortProps.order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
          }
        })
      }

      $.each(tableRows, function (index, row) {
        $("tbody").append(row)
      })
    }

    if (sortProps.columnIndex !== null) {
      sortTableColumn()
    }
  }, [sortProps.order, sortProps.columnIndex])

  return (
    <div className="rounded-md border">
      {/* <pre>{JSON.stringify(responseDynamicData?.[0], null, 2)}</pre> */}
      <Table>
        {/* // - table header */}
        <TableHeader className="bg-slate-100">
          <TableRow>
            {memoizedColumnHeaders.map((col, index) => (
              <TableHead key={index} className={cn(filterColumn ? "align-top" : "align-middle")}>
                <div className={cn(tHeadClassList, col.containerClassName)} style={defaultColumnSize}>
                  <span
                    className={cn(
                      "line-clamp-5 min-w-[3ch] max-w-[20rem] grow",
                      col.className,
                      !col.header.startsWith("Action") && col.sortable !== false && "cursor-pointer"
                    )}
                    onClick={() =>
                      sortColumn(
                        index,
                        sortProps.order === "asc"
                          ? "desc"
                          : sortProps.order === "desc"
                            ? null
                            : sortProps.order === null
                              ? "asc"
                              : null
                      )
                    }
                  >
                    {col.header}
                    {!(col.header.startsWith("Action") || col.sortable) &&
                      sortProps.columnIndex === index &&
                      sortProps.order && (
                        <>
                          {" "}
                          {/* // ! do not remove this space, it's for the icon to be displayed properly with required padding */}
                          <Icon
                            iconName={
                              sortProps.order === "asc"
                                ? "chevron-up"
                                : sortProps.order === "desc"
                                  ? "chevron-down"
                                  : "chevron-up"
                            }
                            iconSize="15"
                          />
                        </>
                      )}
                  </span>

                  {/* // - filter button icon */}
                  {!(col.header.startsWith("Action") || col.filterable) &&
                    !isError &&
                    responseDynamicData &&
                    responseDynamicData.length !== 0 && (
                      <FlyoutMenu
                        sortProps={sortProps}
                        columnHeader={col}
                        onSort={(order) => {
                          console.log("sorting...", order)

                          sortColumn(index, order)
                        }}
                        onFilter={() => setFilterColumn(filterColumn === index ? null : index)}
                      />
                      //
                      // <ButtonIcon
                      //   // title={`Filter by ${col.header}`}
                      //   iconName="dots-vertical"
                      //   iconSize="17"
                      //   className="btn-icon !mr-5 flex items-center justify-center"
                      //   iconColor={variables.gray300}
                      //   clicked={() => setFilterColumn(filterColumn === index ? null : index)}
                      // />
                    )}

                  {/* // - vertical divider */}
                  <span
                    className={cn(
                      "mx-5 h-4 max-h-40 min-h-10 touch-none select-none rounded-[2px] border-[2px] border-black/[0.12]",
                      index === memoizedColumnHeaders.length - 1 && "hidden"
                    )}
                  />
                </div>
                {/* <SearchColumnCell
                  onChange={(val) => {
                    console.log(
                      "searching...",
                      // show/hide rows using `table-pagy-lite-row` class using jQuery by filtering the column values from search input
                      $(`.tpl-cell-${index}`)
                        .filter(function () {
                          return !$(this).text().toLowerCase().includes(val.toLowerCase())
                        })
                        .parents("tr")
                        .siblings()
                        .removeClass("hidden"),
                      $(`.tpl-cell-${index}`)
                        .filter(function () {
                          return $(this).text().toLowerCase().includes(val.toLowerCase())
                        })
                        .parents("tr")
                        .siblings()
                        .addClass("hidden")
                    )
                  }}
                /> */}
                {filterColumn === index && (
                  <SearchColumnCell
                    containerClassName={tCellCommonClassList}
                    placeholder={truncate(`Filter by ${col.header}`, 20)}
                    onChange={(searchText) => {
                      if (searchText.trim() === "") {
                        // If search text is empty, show all rows
                        $("tr:has(.tpl-cell-0)").show()
                        // If search text is empty, hide empty records row
                        !isError &&
                          responseDynamicData &&
                          responseDynamicData.length !== 0 &&
                          $("#empty-records-on-filter").addClass("hidden")
                      } else {
                        // Hide all rows initially
                        $("tr:has(.tpl-cell-0)").hide()

                        // Show rows that match the search text in the current column
                        $(`.tpl-cell-${index}`)
                          .filter(function () {
                            return $(this).text().toLowerCase().includes(searchText.toLowerCase())
                          })
                          .closest("tr")
                          .show()

                        // Show empty records row if no records found
                        $("tr.tpl-row").is(":visible")
                          ? $("#empty-records-on-filter").addClass("hidden")
                          : $("#empty-records-on-filter").removeClass("hidden")
                      }
                    }}
                  />
                )}
              </TableHead>
            ))}
          </TableRow>

          {/* // - top fetching indicator */}
          {isFetching && (
            <TableRow className="border-none">
              <TableCell colSpan={memoizedColumnHeaders.length}>
                <div className="loading-bar-container">
                  <div className="loading-bar"></div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableHeader>

        {/* // + table body */}
        <TableBody className="relative">
          {/* // - loading skeleton */}
          {isLoading &&
            Array.from({ length: pagination.pageSize }).map((_, index) => (
              <TableRow key={index}>
                {memoizedColumnHeaders.map((col, index) => (
                  <TableCell key={index}>
                    <span className={tCellClassList}>
                      <Skeleton width={generateRandomSkeletonWidth(col.header.length)} />
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {/* // - error skeleton */}
          {isError && (
            <TableRow>
              <TableCell colSpan={memoizedColumnHeaders.length}>
                <span className={cn(tCellClassList, "block py-28 text-center italic text-rose-500")}>
                  Error fetching data
                </span>
              </TableCell>
            </TableRow>
          )}
          {/* // - no records to display for API response data */}
          <NoRecordsFound />

          {!isError && responseDynamicData && responseDynamicData.length === 0 ? (
            // - no records to display for API response data
            <NoRecordsFound />
          ) : (
            // + data rendering
            responseDynamicData?.map((item, index) => (
              <TableRow
                key={index}
                className={cn(
                  `tpl-row tpl-row-${index} relative hover:bg-slate-50`,
                  (onRowClick || onRowClickHref) && "cursor-pointer"
                )}
                data-row-index={index}
                onClick={() => onRowClick?.(item)}
              >
                <GenerateCells tCell={item} />
              </TableRow>
            ))
          )}
        </TableBody>

        {/* // - table footer */}
        {/* <TableFooter className="bg-slate-100">
          <TableRow>
            <TableCell colSpan={memoizedColumnHeaders.length}>
              
            </TableCell>
          </TableRow>
        </TableFooter> */}
      </Table>
      {/* // - pagination controls */}
      <div className="border-t bg-slate-100">
        {/* // - bottom fetching indicator */}
        {isFetching && (
          <div className="loading-bar-container !w-4/5">
            <div className="loading-bar !animate-duration-[1.4s]"></div>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 p-1">
          {enablePagination && (
            <>
              <span className="text-sm text-slate-500">Rows per page</span>
              <SelectSingle
                selectSingleProps={{
                  className: "bg-transparent border-none text-slate-800 text-sm",
                  classNames: {
                    container: () => cn("!-ml-40 w-10"),
                    control: () => cn("!border-none !bg-transparent text-right !shadow-none"),
                  },
                  components: {
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => (
                      <svg
                        width={20}
                        height={20}
                        className="-mx-10 fill-slate-500"
                        fill="currentColor"
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291 1.002-1.299 3.044-3.945 4.243-5.498z" />
                      </svg>
                    ),
                  },
                  instanceId: useId(),
                  isClearable: false,
                  isSearchable: false,
                  menuPlacement: "top",
                  placeholder: "Rows/page",
                  defaultValue: rowsPerPageOptions
                    ? rowsPerPageGeneratedOptions(rowsPerPageOptions)[0]
                    : defaultRowsPerPageGeneratedOptions[0],
                  options: rowsPerPageOptions
                    ? rowsPerPageGeneratedOptions(rowsPerPageOptions)
                    : defaultRowsPerPageGeneratedOptions,
                  onChange(newValue, actionMeta) {
                    console.log(newValue, actionMeta)

                    setPagination((prev) => ({ pageIndex: 0, pageSize: Number(newValue?.value) }))
                  },
                }}
              />
              <span className="text-sm text-slate-500">
                {pagination.pageIndex * pagination.pageSize + 1}-
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount)} of {rowCount ?? "0"}
              </span>
              <div className="flex gap-12">
                <ButtonIcon
                  iconName="chevron-left"
                  className="btn-icon"
                  iconColor="stroke-gray-400"
                  clicked={() => {
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                  }}
                  isDisabled={pagination.pageIndex === 0}
                />
                <ButtonIcon
                  iconName="chevron-right"
                  className="btn-icon"
                  iconColor="stroke-gray-400"
                  clicked={() => {
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                  }}
                  isDisabled={rowCount <= (pagination.pageIndex + 1) * pagination.pageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
