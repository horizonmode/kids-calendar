export class Days {
  daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  getDays(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  getFirstDay(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }
  yyyymmdd(date: Date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [
      (mm > 9 ? "" : "0") + mm,
      (dd > 9 ? "" : "0") + dd,
      date.getFullYear(),
    ].join("-");
  }
  getWeekNumber(date: Date) {
    // Copy date so don't modify original
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
    return week;
  }
  weeksInYear(year: number) {
    let month = 11,
      day = 31,
      week,
      d;

    // Find week that 31 Dec is in. If is first week, reduce date until
    // get previous week.
    do {
      d = new Date(year, month, day--);
      week = this.getWeekNumber(d);
    } while (week == 1);

    return week;
  }

  getWeekDay(dayIndex: number) {
    console.log(dayIndex, this.daysOfWeek[dayIndex]);
    return this.daysOfWeek[dayIndex];
  }
}
