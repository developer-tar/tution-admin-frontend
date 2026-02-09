import TutorListPage from "./TutorListPage";

const transform = (row) => ({
  id: row.id,
  course: row.courses?.name ?? "-",
  class_name: row.class_name ?? "-",
  location: row.locations?.name ?? "-",
  week_day: row.weekDays?.name ?? "-",
  start_time: row.start_time ?? "-",
  end_time: row.end_time ?? "-",
});

export default function TutorTimeslots() {
  return (
    <TutorListPage
      title="Timeslots"
      endpoint="tutor/timeslots"
      columns={{ id: "ID", course: "Course", class_name: "Class", location: "Location", week_day: "Day", start_time: "Start", end_time: "End" }}
      transformRow={transform}
    />
  );
}
