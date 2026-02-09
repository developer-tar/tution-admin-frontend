import TutorListPage from "./TutorListPage";

export default function TutorMockExams() {
  return (
    <TutorListPage
      title="Mock Exams"
      endpoint="tutor/mock-exams"
      columns={{ id: "ID", name: "Name", slug: "Slug", status: "Status" }}
    />
  );
}
