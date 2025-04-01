
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-1",
        caption_label: "text-sm font-medium hidden", // Hide the default caption since we use a custom one
        caption_dropdowns: "flex justify-center gap-1 grow items-center",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white/80 p-0 opacity-80 hover:opacity-100 border border-input"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...props }) => {
          return (
            <select
              value={value}
              onChange={(e) => onChange && onChange(e)}
              className="rdp-dropdown"
              {...props}
            >
              {children}
            </select>
          );
        },
        // Custom caption component to show year/month dropdowns
        Caption: ({ displayMonth }) => {
          const navigation = useNavigation();
          const [currentMonth, setCurrentMonth] = React.useState(displayMonth);
          
          React.useEffect(() => {
            setCurrentMonth(displayMonth);
          }, [displayMonth]);
          
          const monthOptions = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(i);
            return {
              value: i,
              label: date.toLocaleString('default', { month: 'long' })
            };
          });
          
          const fromYear = props.fromYear || 1900;
          const toYear = props.toYear || new Date().getFullYear() + 10;
          
          const yearOptions = Array.from(
            { length: toYear - fromYear + 1 },
            (_, i) => fromYear + i
          ).reverse();
          
          return (
            <div className="flex justify-between items-center px-1 gap-1 w-full">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(parseInt(e.target.value));
                  navigation.goToMonth(newMonth);
                }}
                className="rdp-dropdown"
                aria-label="Month"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setFullYear(parseInt(e.target.value));
                  navigation.goToMonth(newMonth);
                }}
                className="rdp-dropdown"
                aria-label="Year"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          );
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
