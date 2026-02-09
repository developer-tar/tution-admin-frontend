import TutorListPage from "./TutorListPage";

const transform = (row) => ({
  id: row.id,
  name: row.name ?? "-",
  topic: row.courseTopic?.name ?? "-",
  subject: row.courseTopic?.subject?.name ?? "-",
});

export default function TutorTests() {
  return (
    <TutorListPage
      title="Tests"
      endpoint="tutor/tests"
      columns={{ id: "ID", name: "Test", topic: "Topic", subject: "Subject" }}
      transformRow={transform}
    />
  );
}
