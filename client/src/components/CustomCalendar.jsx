import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
const CustomCalendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateClick = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onDateSelect(`${year}-${month}-${day}`);
      onClose();
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const dYear = date.getFullYear();
    const dMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dDay = String(date.getDate()).padStart(2, "0");
    const dateStr = `${dYear}-${dMonth}-${dDay}`;

    return dateStr === todayStr;
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`;
    return localDate === selectedDate;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-50 min-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={!date}
            className={`
              h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
              ${!date ? "invisible" : ""}
              ${
                isSelected(date)
                  ? "bg-[#1c2649] text-white shadow-lg transform scale-105"
                  : isToday(date)
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:scale-105"
              }
            `}
          >
            {date && date.getDate()}
          </button>
        ))}
      </div>

      {/* Today button */}
      <div className="mt-1 pt-2 border-t border-gray-100">
        <button
          onClick={() => handleDateClick(new Date())}
          className="w-full cursor-pointer py-2 px-4 bg-linear-to-r from-blue-50 to-purple-50 text-blue-600 rounded-xl font-semibold hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
          style={{ fontFamily: "Plus Jakarta Sans" }}
        >
          Select Today
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
