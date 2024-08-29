import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleSubmit = () => {
    onDateRangeChange(startDate, endDate);
  };

  return (
    <div className="date-range-picker flex flex-col items-center space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
      <DatePicker
        selected={startDate}
        onChange={handleStartDateChange}
        selectsStart
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        placeholderText="Start Date"
        className="h-10 w-32 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <DatePicker
        selected={endDate}
        onChange={handleEndDateChange}
        selectsEnd
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        minDate={startDate ?? undefined}
        placeholderText="End Date"
        className="h-10 w-32 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <button
        onClick={handleSubmit}
        className="h-10 w-32 rounded-md bg-orange-500 px-4 py-1 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </div>
  );
};
