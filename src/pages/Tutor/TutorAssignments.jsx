import TutorListPage from "./TutorListPage";

const transform = (row) => ({
  id: row.id,
  week: row.weeks ? `Week ${row.weeks.week_number}` : "-",
  start_date: row.weeks?.start_date ?? "-",
  end_date: row.weeks?.end_date ?? "-",
});

export default function TutorAssignments() {
  return (
    <TutorListPage
      title="Assignments"
      endpoint="tutor/assignments"
      columns={{ id: "ID", week: "Week", start_date: "Start", end_date: "End" }}
      transformRow={transform}
    />
  );
}
