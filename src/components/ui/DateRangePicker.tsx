
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string;
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ className, date, onSelect }: DateRangePickerProps) {
  const presets = [
    { label: "Last 7 Days", range: { from: addDays(new Date(), -6), to: new Date() } },
    { label: "Last 30 Days", range: { from: addDays(new Date(), -29), to: new Date() } },
    { label: "This Month", range: { from: new Date(new Date().setDate(1)), to: new Date() } },
    { label: "Last Month", range: { from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), to: new Date(new Date().getFullYear(), new Date().getMonth(), 0) } },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-auto md:w-[300px] justify-start text-left font-normal bg-white shadow-sm",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex bg-white" align="end">
          <div className="flex flex-col space-y-2 border-r p-4">
            {presets.map(({ label, range }) => (
              <Button key={label} variant="ghost" className="justify-start" onClick={() => onSelect(range)}>
                {label}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={1} // <<< CHANGED from 2 to 1
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}