import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, showOutsideDays = true, ...props }) {
  const [startDate, setStartDate] = useState(new Date());

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "px-3 py-2 text-sm w-full text-left",
        className
      )}
      onClick={onClick}
      ref={ref}
    >
      {value}
    </button>
  ));

  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      customInput={<CustomInput />}
      inline
      calendarClassName={cn("p-3 border rounded-md shadow-sm", className)}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium">
            {date.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      dayClassName={(date) =>
        cn(
          "p-2 rounded-md text-center text-sm",
          date.toDateString() === new Date().toDateString()
            ? "bg-accent text-accent-foreground"
            : "",
          props.selected?.toDateString() === date.toDateString()
            ? "bg-primary text-primary-foreground"
            : ""
        )
      }
      {...props}
    />
  );
}

export { Calendar };
