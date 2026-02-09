import TutorListPage from "./TutorListPage";

export default function TutorAwards() {
  return (
    <TutorListPage
      title="Awards"
      endpoint="tutor/awards"
      columns={{ id: "ID", name: "Name" }}
    />
  );
}
