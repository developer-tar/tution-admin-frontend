import TutorListPage from "./TutorListPage";

const transformStudent = (row) => ({
  id: row.id,
  course: row.course?.name ?? "-",
  name: row.buyer ? `${row.buyer.first_name || ""} ${row.buyer.last_name || ""}`.trim() || row.buyer.email : "-",
  email: row.buyer?.email ?? "-",
});

export default function TutorStudents() {
  return (
    <TutorListPage
      title="Students (by course)"
      endpoint="tutor/students"
      columns={{ id: "ID", course: "Course", name: "Student", email: "Email" }}
      transformRow={transformStudent}
      courseIdFilter
    />
  );
}
